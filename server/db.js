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

  await run(`CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    contact TEXT NOT NULL,
    email TEXT,
    date TEXT NOT NULL,
    slot TEXT NOT NULL
  )`);
  await run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_appointments_date_slot ON appointments(date, slot)`);

  // ADD: payment columns (ignore errors if they already exist)
  try { await run(`ALTER TABLE appointments ADD COLUMN paid INTEGER NOT NULL DEFAULT 0`); } catch {}
  try { await run(`ALTER TABLE appointments ADD COLUMN payment_order_id TEXT`); } catch {}
  try { await run(`ALTER TABLE appointments ADD COLUMN payment_id TEXT`); } catch {}
  try { await run(`ALTER TABLE appointments ADD COLUMN payment_amount INTEGER`); } catch {}
  try { await run(`ALTER TABLE appointments ADD COLUMN payment_currency TEXT`); } catch {}
  try { await run(`ALTER TABLE appointments ADD COLUMN paid_at TEXT`); } catch {}
  try { await run(`ALTER TABLE appointments ADD COLUMN payment_link_id TEXT`); } catch {}
  try { await run(`ALTER TABLE appointments ADD COLUMN payment_link_url TEXT`); } catch {}

  // Per-day closures
  await run(`CREATE TABLE IF NOT EXISTS unavailable_slots (
    date TEXT NOT NULL,
    slot TEXT NOT NULL,
    PRIMARY KEY (date, slot)
  )`);

  // OTP and verification (if not already present)
  await run(`CREATE TABLE IF NOT EXISTS otps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact TEXT NOT NULL,
    code TEXT NOT NULL,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    used INTEGER NOT NULL DEFAULT 0
  )`);
  await run(`CREATE INDEX IF NOT EXISTS idx_otps_contact_created ON otps(contact, created_at)`);
  await run(`CREATE TABLE IF NOT EXISTS verifications (
    token TEXT PRIMARY KEY,
    contact TEXT NOT NULL,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL
  )`);

  // Patients table to store per-patient meta (conditions/goals/notes later)
  await run(`CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY,            -- existing key (contact/email)
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
    patient_uid TEXT,               -- NEW: stable unique ID
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    updated_at TEXT
  )`);

  // Safe ALTERs for older DBs
  const alter = async (col, def) => { try { await run(`ALTER TABLE patients ADD COLUMN ${col} ${def}`); } catch {} };
  await alter('goal', 'TEXT');        // legacy
  await alter('notes', 'TEXT');       // optional
  await alter('height_cm', 'REAL');
  await alter('weight_kg', 'REAL');
  await alter('age', 'INTEGER');
  await alter('sex', 'TEXT');
  await alter('activity', 'TEXT');
  await alter('diet_pref', 'TEXT');
  await alter('allergies', 'TEXT');
  await alter('patient_uid', 'TEXT');
  await alter('goal_tags', 'TEXT');   // NEW: JSON array
  await alter('goal_notes', 'TEXT');  // NEW: text notes

  // Helpful index
  await run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_patients_uid ON patients(patient_uid)`);
}

function getDb() {
  return Promise.resolve({ run, get, all });
}

module.exports = { init, getDb };
