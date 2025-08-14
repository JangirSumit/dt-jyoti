const { Router } = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db');
const nodemailer = require('nodemailer');
const { escapeHtml } = require('../utils/escape');
const { createInvite } = require('../utils/ics');
const { sendSms, normalizePhone } = require('../utils/sms'); // import normalizePhone

const router = Router();

// Generate slots: 10:00–17:00, every 30 mins, excluding 13:00–14:00
function generateSlots() {
  const out = [];
  const toLabel = (h24, m) => {
    const ampm = h24 >= 12 ? 'PM' : 'AM';
    let h12 = h24 % 12; if (h12 === 0) h12 = 12;
    const mm = String(m).padStart(2, '0');
    return `${h12}:${mm} ${ampm}`;
  };
  for (let h = 10; h < 17; h++) {
    if (h === 13) continue; // break 1–2 PM
    for (let m = 0; m < 60; m += 30) {
      out.push(toLabel(h, m));
    }
  }
  return out;
}

const ALL_SLOTS = generateSlots();
const slotIndex = Object.fromEntries(ALL_SLOTS.map((s, i) => [s, i]));

// Expose master slot options
router.get('/slot-options', (_req, res) => {
  res.json({ slots: ALL_SLOTS });
});

// Available slots = ALL_SLOTS - booked - unavailable
router.get('/slots', async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'date is required' });
  const db = await getDb();
  const bookedRows = await db.all('SELECT slot FROM appointments WHERE date = ?', date);
  const blockedRows = await db.all('SELECT slot FROM unavailable_slots WHERE date = ?', date);
  const booked = bookedRows.map(r => r.slot).sort((a,b)=>slotIndex[a]-slotIndex[b]);
  const blocked = new Set(blockedRows.map(r => r.slot));
  const available = ALL_SLOTS.filter(s => !booked.includes(s) && !blocked.has(s));
  res.json({ date, slots: available, booked, total: ALL_SLOTS.length });
});

// Admin: set available slots for a given date.
// Body: { date: 'YYYY-MM-DD', slots: ['10:00 AM', ...] } (desired available)
// Booked slots remain unavailable regardless of input.
router.put('/slots', async (req, res) => {
  const { date, slots } = req.body || {};
  if (!date || !Array.isArray(slots)) return res.status(400).json({ error: 'date and slots[] required' });

  // validate values are in ALL_SLOTS
  const desired = slots.filter((s) => ALL_SLOTS.includes(s));
  const db = await getDb();

  const bookedRows = await db.all('SELECT slot FROM appointments WHERE date = ?', date);
  const booked = new Set(bookedRows.map(r => r.slot));

  // compute which non-booked slots should be blocked
  const desiredSet = new Set(desired.filter((s) => !booked.has(s)));
  const toBlock = ALL_SLOTS.filter((s) => !booked.has(s) && !desiredSet.has(s));

  // replace unavailable rows for the date
  await db.run('DELETE FROM unavailable_slots WHERE date = ?', date);
  if (toBlock.length) {
    const values = toBlock.flatMap((s) => [date, s]);
    const placeholders = toBlock.map(() => '(?, ?)').join(', ');
    await db.run(`INSERT INTO unavailable_slots (date, slot) VALUES ${placeholders}`, values);
  }

  const blocked = new Set(toBlock);
  const available = ALL_SLOTS.filter(s => !booked.has(s) && !blocked.has(s));
  res.json({ date, available, booked: Array.from(booked) });
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
    const { name, contact, date, slot, email, otpToken } = req.body || {};
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

      const contactNorm = normalizePhone(contact);              // normalize the same way OTP stored it
      if (v.contact !== contactNorm) return res.status(401).json({ error: 'contact mismatch' });
      if (new Date(v.expires_at).getTime() < Date.now()) return res.status(401).json({ error: 'verification expired' });

      // Optionally one-time use token
      // await db.run('DELETE FROM verifications WHERE token = ?', token);
    } catch (ve) {
      return res.status(401).json({ error: 'verification failed' });
    }

    // Prevent booking a blocked or non-existent slot
    if (!ALL_SLOTS.includes(slot)) return res.status(400).json({ error: 'Invalid slot' });
    const db = await getDb();
    const isBlocked = await db.get('SELECT 1 AS x FROM unavailable_slots WHERE date = ? AND slot = ? LIMIT 1', date, slot);
    if (isBlocked) return res.status(409).json({ error: 'Slot unavailable' });

    const existing = await db.get('SELECT 1 FROM appointments WHERE date = ? AND slot = ? LIMIT 1', date, slot);
    if (existing) return res.status(409).json({ error: 'Slot already booked' });

    const appt = { id: uuidv4(), name, contact, date, slot, email: email || '' };
    await db.run('INSERT INTO appointments (id,name,contact,email,date,slot) VALUES (?,?,?,?,?,?)', appt.id, appt.name, appt.contact, appt.email, appt.date, appt.slot);

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

      try { await sendSms(contact, `Appt ${date} ${slot}. Join: ${meetingUrl}`); } catch {}
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

module.exports = { appointmentsRouter: router };
