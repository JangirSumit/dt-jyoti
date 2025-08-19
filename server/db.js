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

  // Appointments table
  await run(`CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    contact TEXT NOT NULL,
    email TEXT,
    date TEXT NOT NULL,
    slot TEXT NOT NULL
  )`);
  await run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_appointments_date_slot ON appointments(date, slot)`);

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
}

function getDb() {
  return Promise.resolve({ run, get, all });
}

module.exports = { init, getDb };
