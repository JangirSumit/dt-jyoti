const { Router } = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db');
const nodemailer = require('nodemailer');
const { sendSms, normalizePhone } = require('../utils/sms');
const { getRazorpay } = require('../utils/razorpay'); // ADD

// Slot options (fallback if not provided by DB/env)
const SLOT_OPTIONS = (process.env.SLOT_OPTIONS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);
const DEFAULT_SLOT_OPTIONS = SLOT_OPTIONS.length ? SLOT_OPTIONS : [
  '10:00 AM','10:30 AM','11:00 AM','11:30 AM',
  '12:00 PM','12:30 PM',
  '2:00 PM','2:30 PM','3:00 PM','3:30 PM','4:00 PM','4:30 PM'
];

const router = Router();

// GET available slot options (for UI)
router.get('/slot-options', (_req, res) => {
  res.json({ slots: DEFAULT_SLOT_OPTIONS });
});

// GET slots + booked for a day
router.get('/slots', async (req, res) => {
  try {
    const date = String(req.query.date || '').slice(0, 10);
    if (!date) return res.status(400).json({ error: 'date required (YYYY-MM-DD)' });

    const db = await getDb();
    const bookedRows = await db.all(`SELECT slot FROM appointments WHERE date = ?`, date);
    const booked = bookedRows.map(r => r.slot);

    const unavailableRows = await db.all(`SELECT slot FROM unavailable_slots WHERE date = ?`, date);
    const unavailable = new Set(unavailableRows.map(r => r.slot));

    const available = DEFAULT_SLOT_OPTIONS.filter(s => !booked.includes(s) && !unavailable.has(s));

    res.json({ date, slots: available, booked });
  } catch (e) {
    console.error('GET /slots failed', e);
    res.status(500).json({ error: 'failed' });
  }
});

// PUT desired available slots for a day (holiday = send [])
router.put('/slots', async (req, res) => {
  try {
    const { date, slots } = req.body || {};
    const day = String(date || '').slice(0, 10);
    if (!day || !Array.isArray(slots)) {
      return res.status(400).json({ error: 'date and slots[] required' });
    }

    // Normalize and validate against known options
    const desired = new Set(slots.filter(s => DEFAULT_SLOT_OPTIONS.includes(s)));

    const db = await getDb();

    // Fetch booked for the day (never touched)
    const bookedRows = await db.all(`SELECT slot FROM appointments WHERE date = ?`, day);
    const booked = new Set(bookedRows.map(r => r.slot));

    // We model “closed” slots in unavailable_slots (per-day)
    // For each option not in desired and not booked -> ensure unavailable row exists
    // For each option in desired -> ensure unavailable row removed
    const toClose = DEFAULT_SLOT_OPTIONS.filter(s => !desired.has(s) && !booked.has(s));
    const toOpen = DEFAULT_SLOT_OPTIONS.filter(s => desired.has(s));

    await db.run('BEGIN');
    try {
      if (toOpen.length) {
        const placeholders = toOpen.map(() => '?').join(',');
        await db.run(
          `DELETE FROM unavailable_slots WHERE date = ? AND slot IN (${placeholders})`,
          day, ...toOpen
        );
      }
      for (const s of toClose) {
        await db.run(
          `INSERT OR IGNORE INTO unavailable_slots (date, slot) VALUES (?, ?)`,
          day, s
        );
      }
      await db.run('COMMIT');
    } catch (e) {
      await db.run('ROLLBACK');
      throw e;
    }

    // Return current state
    const unavailableRows = await db.all(`SELECT slot FROM unavailable_slots WHERE date = ?`, day);
    const unavailableSet = new Set(unavailableRows.map(r => r.slot));
    const available = DEFAULT_SLOT_OPTIONS.filter(s => !booked.has(s) && !unavailableSet.has(s));

    res.json({ date: day, available, booked: Array.from(booked) });
  } catch (e) {
    console.error('PUT /slots failed', e);
    res.status(500).json({ error: 'failed' });
  }
});

// — Existing endpoints below —

function getTransporter() {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true',
      auth: process.env.SMTP_USER && process.env.SMTP_PASS ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    });
  }
  return nodemailer.createTransport({ jsonTransport: true });
}

router.get('/', async (_req, res) => {
  const db = await getDb();
  const rows = await db.all('SELECT * FROM appointments ORDER BY date, slot');
  res.json(rows);
});

router.post('/', async (req, res) => {
  try {
    const { name, contact, date, slot, email, otpToken, patient_uid } = req.body || {};
    if (!name || !contact || !date || !slot) {
      return res.status(400).json({ error: 'name, contact, date, slot are required' });
    }
    // Verify OTP token
    try {
      const db = await getDb();
      const token = otpToken || String(req.headers['x-otp-token'] || '');
      if (!token) return res.status(401).json({ error: 'verification required' });
      const v = await db.get('SELECT * FROM verifications WHERE token = ? LIMIT 1', token);
      if (!v) return res.status(401).json({ error: 'invalid verification' });

      const contactNorm = normalizePhone(contact); // now defined
      if (v.contact !== contactNorm) return res.status(401).json({ error: 'contact mismatch' });
      if (new Date(v.expires_at).getTime() < Date.now()) return res.status(401).json({ error: 'verification expired' });
    } catch (ve) {
      return res.status(401).json({ error: 'verification failed' });
    }

    // Prevent booking a blocked or non-existent slot
    if (!DEFAULT_SLOT_OPTIONS.includes(slot)) return res.status(400).json({ error: 'Invalid slot' }); // FIX

    const db = await getDb();
    const isBlocked = await db.get('SELECT 1 AS x FROM unavailable_slots WHERE date = ? AND slot = ? LIMIT 1', date, slot);
    if (isBlocked) return res.status(409).json({ error: 'Slot unavailable' });

    const existing = await db.get('SELECT 1 FROM appointments WHERE date = ? AND slot = ? LIMIT 1', date, slot);
    if (existing) return res.status(409).json({ error: 'Slot already booked' });

    const appt = { id: uuidv4(), name, contact, date, slot, email: email || '', patient_uid };
    await db.run(
      `INSERT INTO appointments (id, name, contact, email, date, slot, patient_uid)
       VALUES (?,?,?,?,?,?,?)`,
      appt.id, appt.name, appt.contact, appt.email, appt.date, appt.slot, appt.patient_uid || null
    );

    try {
      const transporter = getTransporter();
      const site = process.env.SITE_NAME || 'Dt. Jyoti';
      const toAdmin = process.env.CONTACT_TO || process.env.SMTP_USER || 'noreply@example.com';
      const fromAddr = process.env.MAIL_FROM || `"${site} Appointments" <${process.env.SMTP_USER || 'noreply@example.com'}>`;

      const room = `dtjyoti-${appt.id}`;
      const meetingUrl = `https://meet.jit.si/${room}`;

      const [h, m, ampm] = slot.split(/[: ]/);
      let hour = Number(h) % 12; if ((ampm || '').toUpperCase() === 'PM') hour += 12;
      const startLocal = new Date(`${date}T${String(hour).padStart(2,'0')}:${m || '00'}:00`);
      const endLocal = new Date(startLocal.getTime() + 30 * 60000);
      const ics = createInvite({
        uid: `${appt.id}@dt-jyoti`,
        start: startLocal,
        end: endLocal,
        summary: `Consultation with ${site}`,
        description: `Your consultation is scheduled. Join: ${meetingUrl}`,
        location: 'Online',
        organizerEmail: toAdmin,
        attendeeEmail: email || ''
      });

      await transporter.sendMail({
        from: fromAddr,
        to: toAdmin,
        subject: `New appointment: ${name} – ${date} @ ${slot}`,
        text: `New appointment booked on ${site}.\n\nName: ${name}\nContact: ${contact}\nEmail: ${email || '-'}\nDate: ${date}\nSlot: ${slot}\nMeet: ${meetingUrl}\n` ,
        html: `<p><b>New appointment booked</b> on ${site}.</p>
               <p><b>Name:</b> ${escapeHtml(name)}<br/>
               <b>Contact:</b> ${escapeHtml(contact)}<br/>
               <b>Email:</b> ${escapeHtml(email || '-') }<br/>
               <b>Date:</b> ${escapeHtml(date)}<br/>
               <b>Slot:</b> ${escapeHtml(slot)}<br/>
               <b>Meet:</b> <a href="${meetingUrl}">${meetingUrl}</a></p>`,
        alternatives: [{ contentType: 'text/calendar; method=REQUEST', content: ics }],
        icalEvent: { filename: 'invite.ics', method: 'REQUEST', content: ics }
      });

      if (email && /.+@.+\..+/.test(String(email))) {
        await transporter.sendMail({
          from: fromAddr,
          to: email,
          subject: `Your appointment is confirmed – ${date} @ ${slot}`,
          text: `Hello ${name},\n\nYour appointment is confirmed.\nDate: ${date}\nSlot: ${slot}\nJoin: ${meetingUrl}\n\n— ${site}`,
          html: `<p>Hello ${escapeHtml(name)},</p>
                 <p>Your appointment is <b>confirmed</b>.</p>
                 <p><b>Date:</b> ${escapeHtml(date)}<br/>
                 <b>Slot:</b> ${escapeHtml(slot)}<br/>
                 <b>Join:</b> <a href="${meetingUrl}">${meetingUrl}</a></p>
                 <p>— ${escapeHtml(site)}</p>`,
          alternatives: [{ contentType: 'text/calendar; method=REQUEST', content: ics }],
          icalEvent: { filename: 'invite.ics', method: 'REQUEST', content: ics }
        });
      }

      try { await sendSms(contact, `Appt ${date} ${slot}.`); } catch {}
    } catch (mailErr) {
      console.warn('Appointment mail notification failed:', mailErr.message);
    }

    res.status(201).json(appt);
  } catch (e) {
    console.error('Create appointment failed', e);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

router.delete('/:id', async (req, res) => {
  const db = await getDb();
  const appt = await db.get('SELECT * FROM appointments WHERE id = ?', req.params.id);
  if (!appt) return res.status(404).json({ error: 'Not found' });
  await db.run('DELETE FROM appointments WHERE id = ?', req.params.id);
  res.json(appt);
});

// Send SMS with a Razorpay payment link to complete payment
router.post('/:id/confirm-sms', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    const appt = await db.get(
      'SELECT id,name,contact,email,date,slot,paid,payment_link_id,payment_link_url FROM appointments WHERE id = ? LIMIT 1',
      id
    );
    if (!appt) return res.status(404).json({ error: 'not found' });
    if (appt.paid) return res.status(409).json({ error: 'already paid' });

    const amountInr = parseInt(process.env.APPOINTMENT_FEE_INR || '500', 10);
    const rz = getRazorpay();

    // Reuse existing link if present, else create
    let linkUrl = appt.payment_link_url || '';
    let linkId = appt.payment_link_id || '';

    if (!linkUrl) {
      try {
        const pl = await rz.paymentLink.create({
          amount: amountInr * 100, // FIX: paise
          currency: 'INR',
          accept_partial: false,
          description: `Consultation on ${appt.date} at ${appt.slot}`,
          customer: {
            name: appt.name,
            contact: String(appt.contact),
            email: appt.email || undefined,
          },
          notify: { sms: true, email: !!appt.email },
          reminder_enable: true,
          notes: { appointmentId: appt.id, date: appt.date, slot: appt.slot },
        });
        linkId = pl.id;
        linkUrl = pl.short_url || pl.share_url || pl.url;
        await db.run(
          `UPDATE appointments SET payment_link_id = ?, payment_link_url = ? WHERE id = ?`,
          linkId, linkUrl, appt.id
        );
      } catch (err) {
        console.error('payment link create failed', err);
        return res.status(500).json({ error: 'payment link failed' });
      }
    }

    const to = normalizePhone(appt.contact);
    const msg = `Hi ${appt.name}, your appointment is on ${appt.date} at ${appt.slot}. Please complete the payment of ₹${amountInr} to confirm: ${linkUrl}\n- Dt. Jyoti`;

    try {
      await sendSms(to, msg);
    } catch (e) {
      console.error('sms send failed', e);
      return res.status(500).json({ error: 'sms failed', link: linkUrl });
    }

    res.json({ ok: true, link: linkUrl, linkId });
  } catch (e) {
    console.error('confirm-sms error', e);
    res.status(500).json({ error: 'failed' });
  }
});

module.exports = { appointmentsRouter: router };
