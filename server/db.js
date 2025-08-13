const path = require('path');
const sqlite3 = require('sqlite3').verbose();

let db;

function connect() {
  return new Promise((resolve, reject) => {
    const filename = path.join(process.cwd(), 'server', 'data.sqlite3');
    db = new sqlite3.Database(filename, (err) => {
      if (err) reject(err); else resolve(db);
    });
  });
}

function run(sql, ...params) {
  if (params.length === 1 && Array.isArray(params[0])) params = params[0];
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err); else resolve(this);
    });
  });
}

function get(sql, ...params) {
  if (params.length === 1 && Array.isArray(params[0])) params = params[0];
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err); else resolve(row);
    });
  });
}

function all(sql, ...params) {
  if (params.length === 1 && Array.isArray(params[0])) params = params[0];
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err); else resolve(rows);
    });
  });
}

async function init() {
  if (!db) await connect();
  await run('PRAGMA foreign_keys = ON');
  await run(`CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, created_at TEXT NOT NULL)`);
  await run(`CREATE TABLE IF NOT EXISTS appointments (id TEXT PRIMARY KEY, name TEXT NOT NULL, contact TEXT NOT NULL, email TEXT, date TEXT NOT NULL, slot TEXT NOT NULL)`);
  await run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_appointments_date_slot ON appointments(date, slot)`);
  await run(`CREATE TABLE IF NOT EXISTS patients (id TEXT PRIMARY KEY, name TEXT NOT NULL, contact TEXT NOT NULL, email TEXT, notes TEXT)`);
  await run(`CREATE TABLE IF NOT EXISTS prescriptions (id TEXT PRIMARY KEY, patient_id TEXT NOT NULL, date TEXT NOT NULL, content TEXT NOT NULL, FOREIGN KEY(patient_id) REFERENCES patients(id) ON DELETE CASCADE)`);
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
}

function getDb() {
  if (!db) throw new Error('DB not initialized. Call init() first.');
  return {
    run,
    get,
    all,
  };
}

module.exports = { init, getDb };
