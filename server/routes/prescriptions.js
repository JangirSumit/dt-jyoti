const { Router } = require('express');
const { getDb } = require('../db');

const router = Router();

// List all prescriptions (with patient info)
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const rows = await db.all(
      `SELECT pr.id, pr.content, pr.created_at, pr.updated_at,
              pt.id AS patient_id, pt.name, pt.contact, pt.email, pt.patient_uid
         FROM prescriptions pr
         JOIN patients pt ON pt.id = pr.patient_id
         ORDER BY pr.created_at DESC`
    );
    res.json(rows);
  } catch (e) {
    console.error('list prescriptions failed', e);
    res.status(500).json({ error: 'failed' });
  }
});

// Update prescription
router.put('/:id', async (req, res) => {
  try {
    const id = String(req.params.id || '').trim();
    const content = String(req.body?.content || '').trim();
    if (!content) return res.status(400).json({ error: 'content required' });

    const db = await getDb();
    const now = new Date().toISOString();
    const r = await db.run(
      `UPDATE prescriptions SET content = ?, updated_at = ? WHERE id = ?`,
      content, now, id
    );
    if (r.changes === 0) return res.status(404).json({ error: 'not found' });
    res.json({ ok: true, updated_at: now });
  } catch (e) {
    console.error('update prescription failed', e);
    res.status(500).json({ error: 'failed' });
  }
});

// Delete prescription
router.delete('/:id', async (req, res) => {
  try {
    const id = String(req.params.id || '').trim();
    const db = await getDb();
    const r = await db.run(`DELETE FROM prescriptions WHERE id = ?`, id);
    if (r.changes === 0) return res.status(404).json({ error: 'not found' });
    res.json({ ok: true });
  } catch (e) {
    console.error('delete prescription failed', e);
    res.status(500).json({ error: 'failed' });
  }
});

module.exports = router;