const { Router } = require('express');
const { getDb } = require('../db');
const { v4: uuidv4 } = require('uuid');

const router = Router();

function nowIso() { return new Date().toISOString(); }
function plusMinutes(min) { return new Date(Date.now() + min * 60000).toISOString(); }

function normalizeContact(contact) {
  // Very basic normalization: keep digits and leading +
  const trimmed = String(contact || '').trim();
  if (!trimmed) return '';
  const plus = trimmed.startsWith('+') ? '+' : '';
  const digits = trimmed.replace(/\D/g, '');
  return plus + digits;
}

async function sendOtpSms(contact, code) {
  // Stub: In production, integrate SMS provider (Twilio/MSG91/etc.). For now, log to server.
  console.log(`[OTP] Sending code ${code} to ${contact}`);
  return true;
}

router.post('/request', async (req, res) => {
  try {
    const raw = req.body?.contact;
    const contact = normalizeContact(raw);
    if (!contact || contact.length < 10) return res.status(400).json({ error: 'valid contact required' });

    const db = await getDb();
    // rate limit: allow at most 3 OTPs per 10 minutes per contact
    const tenMinAgo = new Date(Date.now() - 10 * 60000).toISOString();
    const recent = await db.all('SELECT * FROM otps WHERE contact = ? AND created_at > ?', contact, tenMinAgo);
    if (recent.length >= 3) return res.status(429).json({ error: 'Too many requests. Try later.' });

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const createdAt = nowIso();
    const expiresAt = plusMinutes(10);
    await db.run('INSERT INTO otps (contact, code, created_at, expires_at) VALUES (?,?,?,?)', contact, code, createdAt, expiresAt);
    await sendOtpSms(contact, code);
    res.json({ ok: true });
  } catch (e) {
    console.error('OTP request failed', e);
    res.status(500).json({ error: 'failed' });
  }
});

router.post('/verify', async (req, res) => {
  try {
    const raw = req.body?.contact;
    const code = String(req.body?.code || '');
    const contact = normalizeContact(raw);
    if (!contact || !code) return res.status(400).json({ error: 'contact and code required' });
    const db = await getDb();
    const row = await db.get('SELECT * FROM otps WHERE contact = ? AND used = 0 ORDER BY created_at DESC LIMIT 1', contact);
    if (!row) return res.status(400).json({ error: 'no otp requested' });
    if (new Date(row.expires_at).getTime() < Date.now()) return res.status(400).json({ error: 'otp expired' });
    const attempts = (row.attempts || 0) + 1;
    if (attempts > 5) return res.status(429).json({ error: 'too many attempts' });
    await db.run('UPDATE otps SET attempts = ? WHERE id = ?', attempts, row.id);
    if (row.code !== code) return res.status(400).json({ error: 'invalid code' });

    await db.run('UPDATE otps SET used = 1 WHERE id = ?', row.id);
    const token = uuidv4();
    await db.run('INSERT INTO verifications (token, contact, created_at, expires_at) VALUES (?,?,?,?)', token, contact, nowIso(), plusMinutes(30));
    res.json({ token });
  } catch (e) {
    console.error('OTP verify failed', e);
    res.status(500).json({ error: 'failed' });
  }
});

module.exports = { otpRouter: router };
