const { Router } = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db');
const { requireAuth } = require('./auth');

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const db = await getDb();
  const rows = await db.all('SELECT * FROM patients ORDER BY name');
  res.json(rows);
});

router.post('/', requireAuth, async (req, res) => {
  const { name, contact, email, notes } = req.body || {};
  if (!name || !contact) return res.status(400).json({ error: 'name and contact are required' });
  const p = { id: uuidv4(), name, contact, email: email || '', notes: notes || '' };
  const db = await getDb();
  await db.run('INSERT INTO patients (id,name,contact,email,notes) VALUES (?,?,?,?,?)', p.id, p.name, p.contact, p.email, p.notes);
  res.status(201).json(p);
});

router.get('/:id', requireAuth, async (req, res) => {
  const db = await getDb();
  const p = await db.get('SELECT * FROM patients WHERE id = ?', req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json(p);
});

router.put('/:id', requireAuth, async (req, res) => {
  const { name, contact, email, notes } = req.body || {};
  const db = await getDb();
  const p = await db.get('SELECT * FROM patients WHERE id = ?', req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  await db.run('UPDATE patients SET name = COALESCE(?, name), contact = COALESCE(?, contact), email = COALESCE(?, email), notes = COALESCE(?, notes) WHERE id = ?', name, contact, email, notes, req.params.id);
  const updated = await db.get('SELECT * FROM patients WHERE id = ?', req.params.id);
  res.json(updated);
});

router.delete('/:id', requireAuth, async (req, res) => {
  const db = await getDb();
  const p = await db.get('SELECT * FROM patients WHERE id = ?', req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  await db.run('DELETE FROM patients WHERE id = ?', req.params.id);
  res.json(p);
});

router.get('/:id/prescriptions', requireAuth, async (req, res) => {
  const db = await getDb();
  const p = await db.get('SELECT id FROM patients WHERE id = ?', req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  const rows = await db.all('SELECT * FROM prescriptions WHERE patient_id = ? ORDER BY date DESC', req.params.id);
  res.json(rows);
});

router.post('/:id/prescriptions', requireAuth, async (req, res) => {
  const { content } = req.body || {};
  if (!content) return res.status(400).json({ error: 'content is required' });
  const db = await getDb();
  const p = await db.get('SELECT id FROM patients WHERE id = ?', req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  const pres = { id: uuidv4(), patient_id: req.params.id, date: new Date().toISOString(), content };
  await db.run('INSERT INTO prescriptions (id, patient_id, date, content) VALUES (?,?,?,?)', pres.id, pres.patient_id, pres.date, pres.content);
  res.status(201).json(pres);
});

module.exports = { patientsRouter: router };
