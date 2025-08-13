const { Router } = require('express');
const nodemailer = require('nodemailer');
const { escapeHtml } = require('../utils/escape');

const router = Router();

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

router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body || {};
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'name, email, message are required' });
    }

    const transporter = getTransporter();
    const toAddress = process.env.CONTACT_TO || process.env.SMTP_USER || 'noreply@example.com';
    const site = process.env.SITE_NAME || 'Dt. Jyoti';
    const mailOptions = {
      from: process.env.MAIL_FROM || `"${site} Contact" <${process.env.SMTP_USER || 'noreply@example.com'}>` ,
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

module.exports = { contactRouter: router };
