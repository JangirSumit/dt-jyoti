const { Router } = require('express');
const { getDb } = require('../db');

const router = Router();

// Build a 3-letter prefix from name/contact/email
function makePrefix(name, contact, email) {
  const pick =
    (name || '').trim() ||
    (email ? String(email).split('@')[0] : '') ||
    String(contact || '');
  const letters = pick.toUpperCase().replace(/[^A-Z]/g, '');
  const base = (letters || 'PAT').padEnd(3, 'X').slice(0, 3);
  return base;
}

// Create next incremental id for a prefix in a transaction
async function createNextPatientUid(db, prefix) {
  // Lock rows for consistent MAX() read
  await db.run('BEGIN IMMEDIATE');
  try {
    const row = await db.get(
      `SELECT MAX(CAST(SUBSTR(patient_uid, 4) AS INTEGER)) AS maxnum
       FROM patients
       WHERE SUBSTR(patient_uid, 1, 3) = ?`,
      prefix
    );
    const next = (row?.maxnum || 0) + 1;
    const uid = `${prefix}${String(next).padStart(6, '0')}`;
    await db.run('COMMIT');
    return uid;
  } catch (e) {
    try { await db.run('ROLLBACK'); } catch {}
    throw e;
  }
}

// Ensure a row has a patient_uid; if missing, generate and update
async function ensurePatientUid(db, id, name, contact, email) {
  const row = await db.get(`SELECT patient_uid FROM patients WHERE id = ?`, id);
  if (row?.patient_uid) return row.patient_uid;

  const prefix = makePrefix(name, contact, email);
  // Attempt and retry once on uniqueness race
  for (let i = 0; i < 2; i++) {
    const uid = await createNextPatientUid(db, prefix);
    try {
      await db.run(`UPDATE patients SET patient_uid = ?, updated_at = ? WHERE id = ?`, uid, new Date().toISOString(), id);
      return uid;
    } catch (e) {
      // Unique collision -> retry to get next number
      if (String(e?.message || '').toLowerCase().includes('unique')) continue;
      throw e;
    }
  }
  // Last resort: take next again
  const uid = await createNextPatientUid(db, prefix);
  await db.run(`UPDATE patients SET patient_uid = ?, updated_at = ? WHERE id = ?`, uid, new Date().toISOString(), id);
  return uid;
}

// Get a patient's meta by id (contact or email key)
router.get('/:id', async (req, res) => {
  try {
    const id = String(req.params.id || '').trim();
    if (!id) return res.status(400).json({ error: 'id required' });
    const db = await getDb();

    let p = await db.get(
      `SELECT id, name, contact, email, conditions, goal, notes,
              height_cm, weight_kg, age, sex, activity, diet_pref, allergies, patient_uid,
              goal_tags, goal_notes
         FROM patients WHERE id = ?`,
      id
    );

    const now = new Date().toISOString();
    if (!p) {
      // Create a bare row with generated patient_uid
      const uid = await createNextPatientUid(db, makePrefix('', id, ''));
      await db.run(
        `INSERT INTO patients (id, patient_uid, created_at, updated_at) VALUES (?,?,?,?)`,
        id, uid, now, now
      );
      p = await db.get(
        `SELECT id, name, contact, email, conditions, goal, notes,
                height_cm, weight_kg, age, sex, activity, diet_pref, allergies, patient_uid
           FROM patients WHERE id = ?`,
        id
      );
    } else if (!p.patient_uid) {
      const uid = await ensurePatientUid(db, id, p.name, p.contact, p.email);
      p.patient_uid = uid;
    }

    return res.json({
      id: p.id,
      patientId: p.patient_uid,
      conditions: p?.conditions ? JSON.parse(p.conditions) : [],
      allergies: p?.allergies ? JSON.parse(p.allergies) : [],
      height_cm: p?.height_cm ?? null,
      weight_kg: p?.weight_kg ?? null,
      age: p?.age ?? null,
      sex: p?.sex ?? '',
      activity: p?.activity ?? '',
      diet_pref: p?.diet_pref ?? '',
      goalTags: p?.goal_tags ? JSON.parse(p.goal_tags) : [],
      goalNotes: typeof p?.goal_notes === 'string' ? p.goal_notes : (p?.goal || ''),
      notes: p?.notes || '',
      name: p?.name || '',
      contact: p?.contact || '',
      email: p?.email || ''
    });
  } catch (e) {
    console.error('patients GET error', e);
    res.status(500).json({ error: 'failed' });
  }
});

// Upsert full meta (conditions + metrics)
router.put('/:id/meta', async (req, res) => {
  try {
    const id = String(req.params.id || '').trim();
    if (!id) return res.status(400).json({ error: 'id required' });
    const b = req.body || {};

    const db = await getDb();
    const now = new Date().toISOString();

    // Upsert base row if missing
    const exists = await db.get(`SELECT id FROM patients WHERE id = ?`, id);
    if (!exists) {
      const uid = await createNextPatientUid(db, makePrefix(b.name, b.contact, b.email));
      await db.run(
        `INSERT INTO patients (id, patient_uid, created_at, updated_at) VALUES (?,?,?,?)`,
        id, uid, now, now
      );
    } else {
      // Ensure it has a patient_uid
      await ensurePatientUid(db, id, b.name, b.contact, b.email);
    }

    const conditions = Array.isArray(b.conditions) ? b.conditions.filter(Boolean) : [];
    const allergies = Array.isArray(b.allergies) ? b.allergies.filter(Boolean) : [];
    const height_cm = b.height_cm === '' || b.height_cm == null ? null : Number(b.height_cm);
    const weight_kg = b.weight_kg === '' || b.weight_kg == null ? null : Number(b.weight_kg);
    const age = b.age === '' || b.age == null ? null : parseInt(b.age, 10);
    const goalTags = Array.isArray(b.goalTags) ? b.goalTags.filter(Boolean) : [];
    const goalNotes = typeof b.goalNotes === 'string' ? b.goalNotes.trim() : '';

    await db.run(
      `UPDATE patients
         SET name = COALESCE(?, name),
             contact = COALESCE(?, contact),
             email = COALESCE(?, email),
             conditions = ?,
             allergies = ?,
             height_cm = ?,
             weight_kg = ?,
             age = ?,
             sex = ?,
             activity = ?,
             diet_pref = ?,
             goal_tags = ?,            -- NEW
             goal_notes = ?,           -- NEW
             goal = ?,                 -- keep legacy mirror of notes
             updated_at = ?
       WHERE id = ?`,
      b.name || null, b.contact || null, b.email || null,
      JSON.stringify(conditions), JSON.stringify(allergies),
      height_cm, weight_kg, age, b.sex || '', b.activity || '', b.diet_pref || '',
      JSON.stringify(goalTags),
      goalNotes,
      goalNotes,
      now, id
    );

    res.json({ ok: true });
  } catch (e) {
    console.error('patients PUT meta error', e);
    res.status(500).json({ error: 'failed' });
  }
});

module.exports = { patientsRouter: router };
