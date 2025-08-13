const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const { init, getDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

const SLOTS = ['09:00 AM','10:00 AM','11:00 AM','12:00 PM','02:00 PM','03:00 PM','04:00 PM'];

// Get available slots for a date
app.get('/api/slots', async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'date is required' });
  const db = await getDb();
  const rows = await db.all('SELECT slot FROM appointments WHERE date = ?', date);
  const booked = rows.map(r => r.slot);
  const available = SLOTS.filter(s => !booked.includes(s));
  res.json({ date, slots: available });
});

// List appointments
app.get('/api/appointments', async (req, res) => {
  const db = await getDb();
  const rows = await db.all('SELECT * FROM appointments ORDER BY date, slot');
  res.json(rows);
});

// Create appointment + email notifications
app.post('/api/appointments', async (req, res) => {
  try {
    const { name, contact, date, slot, email } = req.body || {};
    if (!name || !contact || !date || !slot) {
      return res.status(400).json({ error: 'name, contact, date, slot are required' });
    }
  const db = await getDb();
  const existing = await db.get('SELECT 1 FROM appointments WHERE date = ? AND slot = ? LIMIT 1', date, slot);
  if (existing) return res.status(409).json({ error: 'Slot already booked' });

  const appt = { id: uuidv4(), name, contact, date, slot, email: email || '' };
  await db.run('INSERT INTO appointments (id,name,contact,email,date,slot) VALUES (?,?,?,?,?,?)', appt.id, appt.name, appt.contact, appt.email, appt.date, appt.slot);

    // Fire-and-forget email notifications (do not block success on failure)
    try {
      const transporter = getTransporter();
      const site = process.env.SITE_NAME || 'Dt. Jyoti';
      const toAdmin = process.env.CONTACT_TO || process.env.SMTP_USER || 'noreply@example.com';
      const fromAddr = process.env.MAIL_FROM || `"${site} Appointments" <${process.env.SMTP_USER || 'noreply@example.com'}>`;

      // Admin notification
      await transporter.sendMail({
        from: fromAddr,
        to: toAdmin,
        subject: `New appointment: ${name} – ${date} @ ${slot}`,
        text: `New appointment booked on ${site}.\n\nName: ${name}\nContact: ${contact}\nEmail: ${email || '-'}\nDate: ${date}\nSlot: ${slot}\n` ,
        html: `<p><b>New appointment booked</b> on ${site}.</p>
               <p><b>Name:</b> ${escapeHtml(name)}<br/>
               <b>Contact:</b> ${escapeHtml(contact)}<br/>
               <b>Email:</b> ${escapeHtml(email || '-')}<br/>
               <b>Date:</b> ${escapeHtml(date)}<br/>
               <b>Slot:</b> ${escapeHtml(slot)}</p>`
      });

      // User confirmation (if email provided)
      if (email && /.+@.+\..+/.test(String(email))) {
        await transporter.sendMail({
          from: fromAddr,
          to: email,
          subject: `Your appointment is confirmed – ${date} @ ${slot}`,
          text: `Hello ${name},\n\nYour appointment is confirmed.\nDate: ${date}\nSlot: ${slot}\n\nIf you need to reschedule, reply to this email.\n\n— ${site}`,
          html: `<p>Hello ${escapeHtml(name)},</p>
                 <p>Your appointment is <b>confirmed</b>.</p>
                 <p><b>Date:</b> ${escapeHtml(date)}<br/>
                 <b>Slot:</b> ${escapeHtml(slot)}</p>
                 <p>If you need to reschedule, just reply to this email.</p>
                 <p>— ${escapeHtml(site)}</p>`
        });
      }
    } catch (mailErr) {
      console.warn('Appointment mail notification failed:', mailErr.message);
    }

    res.status(201).json(appt);
  } catch (e) {
    console.error('Create appointment failed', e);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

// Delete appointment
app.delete('/api/appointments/:id', async (req, res) => {
  const db = await getDb();
  const appt = await db.get('SELECT * FROM appointments WHERE id = ?', req.params.id);
  if (!appt) return res.status(404).json({ error: 'Not found' });
  await db.run('DELETE FROM appointments WHERE id = ?', req.params.id);
  res.json(appt);
});

// Contact form email endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body || {};
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'name, email, message are required' });
    }

    const transporter = getTransporter();
    const toAddress = process.env.CONTACT_TO || process.env.SMTP_USER || 'noreply@example.com';
    const site = process.env.SITE_NAME || 'Dt. Jyoti';
    const mailOptions = {
      from: process.env.MAIL_FROM || `"${site} Contact" <${process.env.SMTP_USER || 'noreply@example.com'}>`,
      to: toAddress,
      subject: `New contact message from ${name}`,
      replyTo: email,
      text: `You received a new message from ${site} contact form.\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `<p>You received a new message from <b>${site}</b> contact form.</p>
             <p><b>Name:</b> ${escapeHtml(name)}<br/>
             <b>Email:</b> ${escapeHtml(email)}</p>
             <p><b>Message:</b><br/>${escapeHtml(message).replace(/\n/g,'<br/>')}</p>`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Contact mail queued/sent:', info && (info.messageId || info));
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Contact mail failed', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Minimal HTML escape
function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

// Shared mail transporter (SMTP if configured; otherwise JSON logging)
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

// -------- Auth (very simple token) --------
function getAuthToken(req) {
  const h = req.headers['authorization'] || '';
  if (!h.startsWith('Bearer ')) return null;
  return h.slice(7);
}

async function requireAuth(req, res, next) {
  const token = getAuthToken(req);
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const db = await getDb();
  const row = await db.get('SELECT token FROM sessions WHERE token = ?', token);
  if (!row) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body || {};
  const u = process.env.ADMIN_USER || 'admin';
  const p = process.env.ADMIN_PASS || 'password';
  if (username !== u || password !== p) return res.status(401).json({ error: 'Invalid credentials' });
  const token = uuidv4();
  const db = await getDb();
  await db.run('INSERT INTO sessions (token, created_at) VALUES (?, ?)', token, new Date().toISOString());
  res.json({ token });
});

app.post('/api/auth/logout', async (req, res) => {
  const token = getAuthToken(req);
  if (token) {
    const db = await getDb();
    await db.run('DELETE FROM sessions WHERE token = ?', token);
  }
  res.json({ ok: true });
});

app.get('/api/auth/me', async (req, res) => {
  const token = getAuthToken(req);
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const db = await getDb();
  const row = await db.get('SELECT token FROM sessions WHERE token = ?', token);
  if (row) return res.json({ ok: true });
  res.status(401).json({ error: 'Unauthorized' });
});

// Patients CRUD
app.get('/api/patients', requireAuth, async (req, res) => {
  const db = await getDb();
  const rows = await db.all('SELECT * FROM patients ORDER BY name');
  res.json(rows);
});

app.post('/api/patients', requireAuth, async (req, res) => {
  const { name, contact, email, notes } = req.body || {};
  if (!name || !contact) return res.status(400).json({ error: 'name and contact are required' });
  const p = { id: uuidv4(), name, contact, email: email || '', notes: notes || '' };
  const db = await getDb();
  await db.run('INSERT INTO patients (id,name,contact,email,notes) VALUES (?,?,?,?,?)', p.id, p.name, p.contact, p.email, p.notes);
  res.status(201).json(p);
});

app.get('/api/patients/:id', requireAuth, async (req, res) => {
  const db = await getDb();
  const p = await db.get('SELECT * FROM patients WHERE id = ?', req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json(p);
});

app.put('/api/patients/:id', requireAuth, async (req, res) => {
  const { name, contact, email, notes } = req.body || {};
  const db = await getDb();
  const p = await db.get('SELECT * FROM patients WHERE id = ?', req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  await db.run('UPDATE patients SET name = COALESCE(?, name), contact = COALESCE(?, contact), email = COALESCE(?, email), notes = COALESCE(?, notes) WHERE id = ?', name, contact, email, notes, req.params.id);
  const updated = await db.get('SELECT * FROM patients WHERE id = ?', req.params.id);
  res.json(updated);
});

app.delete('/api/patients/:id', requireAuth, async (req, res) => {
  const db = await getDb();
  const p = await db.get('SELECT * FROM patients WHERE id = ?', req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  await db.run('DELETE FROM patients WHERE id = ?', req.params.id);
  res.json(p);
});

// Prescriptions for a patient
app.get('/api/patients/:id/prescriptions', requireAuth, async (req, res) => {
  const db = await getDb();
  const p = await db.get('SELECT id FROM patients WHERE id = ?', req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  const rows = await db.all('SELECT * FROM prescriptions WHERE patient_id = ? ORDER BY date DESC', req.params.id);
  res.json(rows);
});

app.post('/api/patients/:id/prescriptions', requireAuth, async (req, res) => {
  const { content } = req.body || {};
  if (!content) return res.status(400).json({ error: 'content is required' });
  const db = await getDb();
  const p = await db.get('SELECT id FROM patients WHERE id = ?', req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  const pres = { id: uuidv4(), patient_id: req.params.id, date: new Date().toISOString(), content };
  await db.run('INSERT INTO prescriptions (id, patient_id, date, content) VALUES (?,?,?,?)', pres.id, pres.patient_id, pres.date, pres.content);
  res.status(201).json(pres);
});

// Admin: Add a blog (write markdown file)
const fs = require('fs');
const path = require('path');
app.post('/api/admin/blog', requireAuth, (req, res) => {
  const { slug, title, cover, content } = req.body || {};
  if (!slug || !title || !content) return res.status(400).json({ error: 'slug, title, content required' });
  if (!/^[-a-z0-9]+$/.test(slug)) return res.status(400).json({ error: 'slug must be lowercase letters, numbers, and hyphens' });
  const filePath = path.join(process.cwd(), 'public', 'blog', `${slug}.md`);
  const fm = `---\ntitle: ${title}\ncover: ${cover || '/images/abstract/a1.svg'}\n---\n\n`;
  try {
    fs.writeFileSync(filePath, fm + content, 'utf8');
    res.status(201).json({ ok: true, path: `/blog/${slug}.md` });
  } catch (e) {
    console.error('Failed to write blog', e);
    res.status(500).json({ error: 'Failed to write blog file' });
  }
});

init().then(() => {
  app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
}).catch((e) => {
  console.error('Failed to init DB', e);
  process.exit(1);
});
