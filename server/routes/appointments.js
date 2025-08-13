const { Router } = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db');
const nodemailer = require('nodemailer');
const { escapeHtml } = require('../utils/escape');
const { createInvite } = require('../utils/ics');
const { sendSms } = require('../utils/sms');

const router = Router();

const SLOTS = ['09:00 AM','10:00 AM','11:00 AM','12:00 PM','02:00 PM','03:00 PM','04:00 PM'];

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

router.get('/slots', async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'date is required' });
  const db = await getDb();
  const rows = await db.all('SELECT slot FROM appointments WHERE date = ?', date);
  const booked = rows.map(r => r.slot);
  const available = SLOTS.filter(s => !booked.includes(s));
  res.json({ date, slots: available });
});

router.get('/', async (req, res) => {
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
    // Verify OTP token for given contact (30 min window)
    try {
      const db = await getDb();
      const token = otpToken || String(req.headers['x-otp-token'] || '');
      if (!token) return res.status(401).json({ error: 'verification required' });
      const v = await db.get('SELECT * FROM verifications WHERE token = ? LIMIT 1', token);
      if (!v) return res.status(401).json({ error: 'invalid verification' });
      if (v.contact !== String(contact).replace(/\D/g, '')) return res.status(401).json({ error: 'contact mismatch' });
      if (new Date(v.expires_at).getTime() < Date.now()) return res.status(401).json({ error: 'verification expired' });
    } catch (ve) {
      return res.status(401).json({ error: 'verification failed' });
    }
    const db = await getDb();
    const existing = await db.get('SELECT 1 FROM appointments WHERE date = ? AND slot = ? LIMIT 1', date, slot);
    if (existing) return res.status(409).json({ error: 'Slot already booked' });

    const appt = { id: uuidv4(), name, contact, date, slot, email: email || '' };
    await db.run('INSERT INTO appointments (id,name,contact,email,date,slot) VALUES (?,?,?,?,?,?)', appt.id, appt.name, appt.contact, appt.email, appt.date, appt.slot);

    try {
      const transporter = getTransporter();
      const site = process.env.SITE_NAME || 'Dt. Jyoti';
      const toAdmin = process.env.CONTACT_TO || process.env.SMTP_USER || 'noreply@example.com';
      const fromAddr = process.env.MAIL_FROM || `"${site} Appointments" <${process.env.SMTP_USER || 'noreply@example.com'}>`;

      // Create a simple online meeting link (free Jitsi room)
      const room = `dtjyoti-${appt.id}`;
      const meetingUrl = `https://meet.jit.si/${room}`;

      // Build ICS invite for 30 minutes duration in UTC
      const [h, m, ampm] = slot.split(/[: ]/); // naive parse like '10:00 AM'
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
          text: `Hello ${name},\n\nYour appointment is confirmed.\nDate: ${date}\nSlot: ${slot}\nJoin: ${meetingUrl}\n\nIf you need to reschedule, reply to this email.\n\n— ${site}`,
          html: `<p>Hello ${escapeHtml(name)},</p>
                 <p>Your appointment is <b>confirmed</b>.</p>
                 <p><b>Date:</b> ${escapeHtml(date)}<br/>
                 <b>Slot:</b> ${escapeHtml(slot)}<br/>
                 <b>Join:</b> <a href="${meetingUrl}">${meetingUrl}</a></p>
                 <p>If you need to reschedule, just reply to this email.</p>
                 <p>— ${escapeHtml(site)}</p>`,
          alternatives: [{ contentType: 'text/calendar; method=REQUEST', content: ics }],
          icalEvent: { filename: 'invite.ics', method: 'REQUEST', content: ics }
        });
      }

      // SMS confirmation (optional)
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
