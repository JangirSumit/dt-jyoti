const { Router } = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db');

const router = Router();

function getAuthToken(req) {
  const h = req.headers['authorization'] || '';
  if (!h.startsWith('Bearer ')) return null;
  return h.slice(7);
}

async function requireAuth(req, res, next) {
  try {
    const token = getAuthToken(req);
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const db = await getDb();
    const row = await db.get('SELECT token FROM sessions WHERE token = ?', token);
    if (!row) return res.status(401).json({ error: 'Unauthorized' });
    next();
  } catch (e) {
    next(e);
  }
}

router.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  const u = process.env.ADMIN_USER || 'admin';
  const p = process.env.ADMIN_PASS || 'password';
  if (username !== u || password !== p) return res.status(401).json({ error: 'Invalid credentials' });
  const token = uuidv4();
  const db = await getDb();
  await db.run('INSERT INTO sessions (token, created_at) VALUES (?, ?)', token, new Date().toISOString());
  res.json({ token });
});

router.post('/logout', async (req, res) => {
  const token = getAuthToken(req);
  if (token) {
    const db = await getDb();
    await db.run('DELETE FROM sessions WHERE token = ?', token);
  }
  res.json({ ok: true });
});

router.get('/me', async (req, res) => {
  const token = getAuthToken(req);
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const db = await getDb();
  const row = await db.get('SELECT token FROM sessions WHERE token = ?', token);
  if (row) return res.json({ ok: true });
  res.status(401).json({ error: 'Unauthorized' });
});

module.exports = { authRouter: router, requireAuth };
