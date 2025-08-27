const path = require('path');
const sqlite3 = require('sqlite3').verbose();

let db;

function connect() {
  return new Promise((resolve, reject) => {
    if (db) return resolve(db);
    const file = path.join(__dirname, 'data.sqlite');
    db = new sqlite3.Database(file, (err) => (err ? reject(err) : resolve(db)));
  });
}

function run(sql, ...params) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}
function get(sql, ...params) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
  });
}
function all(sql, ...params) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });
}

async function init() {
  if (!db) await connect();

  await run('PRAGMA foreign_keys = ON');
  try { await get('PRAGMA journal_mode = WAL'); } catch {}

  // Appointments (includes payments + patient_uid)
  await run(`
    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      contact TEXT NOT NULL,
      email TEXT,
      date TEXT NOT NULL,
      slot TEXT NOT NULL,
      paid INTEGER NOT NULL DEFAULT 0,
      payment_order_id TEXT,
      payment_id TEXT,
      payment_amount INTEGER,
      payment_currency TEXT,
      paid_at TEXT,
      payment_link_id TEXT,
      payment_link_url TEXT,
      patient_uid TEXT
    )
  `);
  await run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_appointments_date_slot ON appointments(date, slot)`);

  await run(`
    CREATE TABLE IF NOT EXISTS unavailable_slots (
      date TEXT NOT NULL,
      slot TEXT NOT NULL,
      PRIMARY KEY (date, slot)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS otps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contact TEXT NOT NULL,
      code TEXT NOT NULL,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      used INTEGER NOT NULL DEFAULT 0
    )
  `);
  await run(`CREATE INDEX IF NOT EXISTS idx_otps_contact_created ON otps(contact, created_at)`);
  await run(`
    CREATE TABLE IF NOT EXISTS verifications (
      token TEXT PRIMARY KEY,
      contact TEXT NOT NULL,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL
    )
  `);

  // Patients (latest schema: patient_id PK)
  await run(`
    CREATE TABLE IF NOT EXISTS patients (
      patient_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      contact TEXT,
      email TEXT,
      conditions TEXT,
      goal TEXT,
      notes TEXT,
      height_cm REAL,
      weight_kg REAL,
      age INTEGER,
      sex TEXT,
      activity TEXT,
      diet_pref TEXT,
      allergies TEXT,
      patient_uid TEXT,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
      updated_at TEXT,
      goal_tags TEXT,
      goal_notes TEXT
    )
  `);
  await run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_patients_uid ON patients(patient_uid)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_patients_contact ON patients(contact)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email)`);

  // Prescriptions (FK -> patients.patient_id)
  await run(`
    CREATE TABLE IF NOT EXISTS prescriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
    )
  `);
  await run(`CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON prescriptions(patient_id)`);
}

function getDb() {
  return Promise.resolve({ run, get, all });
}

module.exports = { init, getDb };