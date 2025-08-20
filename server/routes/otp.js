const { Router } = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db');
const { sendSms, normalizePhone } = require('../utils/sms');

const router = Router();

function nowIso() { return new Date().toISOString(); }
function addMinutes(min) { return new Date(Date.now() + min * 60000).toISOString(); }

router.post('/request', async (req, res) => {
  try {
    const raw = String((req.body && req.body.contact) || '');
    const contact = normalizePhone(raw);
    if (!contact) return res.status(400).json({ error: 'contact required' });

    const db = await getDb();
    const recent = await db.get(
      `SELECT created_at FROM otps WHERE contact = ? ORDER BY created_at DESC LIMIT 1`,
      contact
    );
    if (recent && Date.now() - new Date(recent.created_at).getTime() < 60 * 1000) {
      return res.status(429).json({ error: 'Please wait a minute before requesting another OTP.' });
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    await db.run(
      `INSERT INTO otps (contact, code, created_at, expires_at, attempts, used) VALUES (?,?,?,?,0,0)`,
      contact, code, nowIso(), addMinutes(Number(process.env.OTP_TTL_MIN || 10))
    );

    const site = process.env.SITE_NAME || 'Dt. Jyoti';
    const ok = await sendSms(contact, `${site}: Your verification code is ${code}. Valid for 10 minutes.`);
    if (!ok) return res.status(500).json({ error: 'sms_failed' });

    res.json({ ok: true });
  } catch (e) {
    console.error('OTP request failed', e);
    res.status(500).json({ error: 'failed' });
  }
});

router.post('/verify', async (req, res) => {
  try {
    const raw = String((req.body && req.body.contact) || '');
    const contact = normalizePhone(raw);
    const code = String((req.body && req.body.code) || '').trim();
    if (!contact || !code) return res.status(400).json({ error: 'contact and code required' });

    const db = await getDb();
    const row = await db.get(
      `SELECT rowid as id, * FROM otps
       WHERE contact = ? AND used = 0
       ORDER BY created_at DESC LIMIT 1`,
      contact
    );
    if (!row) return res.status(400).json({ error: 'invalid code' });

    const expired = new Date(row.expires_at).getTime() < Date.now();
    if (expired || row.code !== code) {
      await db.run(`UPDATE otps SET attempts = attempts + 1 WHERE rowid = ?`, row.id);
      return res.status(400).json({ error: 'invalid code' });
    }

    await db.run(`UPDATE otps SET used = 1 WHERE rowid = ?`, row.id);

    const token = uuidv4();
    const ttl = Number(process.env.OTP_TOKEN_TTL_MIN || 30);
    await db.run(
      `INSERT INTO verifications (token, contact, created_at, expires_at) VALUES (?,?,?,?)`,
      token, contact, nowIso(), addMinutes(ttl)
    );

    await db.run(`DELETE FROM otps WHERE used = 1 OR expires_at < ?`, nowIso());

    res.json({ token });
  } catch (e) {
    console.error('OTP verify failed', e);
    res.status(500).json({ error: 'failed' });
  }
});

module.exports = router;
