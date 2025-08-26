const sql = require('mssql');

let pool;

function inferType(v) {
  if (v === null || v === undefined) return sql.NVarChar; // allow nulls
  if (typeof v === 'number') return Number.isInteger(v) ? sql.Int : sql.Float;
  if (typeof v === 'boolean') return sql.Bit;
  return sql.NVarChar(sql.MAX);
}

function mapParams(req, params) {
  params.forEach((v, i) => {
    const name = `p${i + 1}`;
    req.input(name, inferType(v), v);
  });
}

function bindQuestionParams(sqlText, params) {
  // Replace each ? with @p1, @p2, …
  let i = 0;
  const text = sqlText.replace(/\?/g, () => {
    i += 1;
    return `@p${i}`;
  });
  if (i !== params.length) {
    throw new Error(`Param count mismatch: found ${i} placeholders, got ${params.length} params`);
  }
  return text;
}

async function connect() {
  if (pool) return pool;
  const config = {
    server: process.env.MSSQL_SERVER,
    database: process.env.MSSQL_DATABASE,
    user: process.env.MSSQL_USER,
    password: process.env.MSSQL_PASSWORD,
    options: {
      encrypt: String(process.env.MSSQL_ENCRYPT || 'true').toLowerCase() === 'true',
      trustServerCertificate: String(process.env.MSSQL_TRUST_CERT || 'false').toLowerCase() === 'true',
    },
    pool: { max: 10, min: 1, idleTimeoutMillis: 30000 },
  };
  pool = await sql.connect(config);
  return pool;
}

async function run(q, ...params) {
  await connect();
  const request = pool.request();
  const text = bindQuestionParams(q, params);
  mapParams(request, params);
  const result = await request.query(text);
  return result; // mirrors sqlite run returning statement info
}

async function get(q, ...params) {
  await connect();
  const request = pool.request();
  const text = bindQuestionParams(q, params);
  mapParams(request, params);
  const result = await request.query(text);
  return result.recordset[0] || null;
}

async function all(q, ...params) {
  await connect();
  const request = pool.request();
  const text = bindQuestionParams(q, params);
  mapParams(request, params);
  const result = await request.query(text);
  return result.recordset || [];
}

async function init() {
  await connect();

  // Appointments
  await run(`
    IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[appointments]') AND type = N'U')
    CREATE TABLE dbo.appointments (
      id NVARCHAR(64) NOT NULL PRIMARY KEY,
      name NVARCHAR(200) NOT NULL,
      contact NVARCHAR(32) NOT NULL,
      email NVARCHAR(200) NULL,
      date NVARCHAR(16) NOT NULL,
      slot NVARCHAR(32) NOT NULL,
      paid BIT NOT NULL DEFAULT 0,
      payment_order_id NVARCHAR(100) NULL,
      payment_id NVARCHAR(100) NULL,
      payment_amount INT NULL,
      payment_currency NVARCHAR(8) NULL,
      paid_at NVARCHAR(32) NULL,
      payment_link_id NVARCHAR(100) NULL,
      payment_link_url NVARCHAR(512) NULL,
      patient_uid NVARCHAR(64) NULL
    )
  `);
  await run(`
    IF NOT EXISTS (
      SELECT 1 FROM sys.indexes WHERE name = 'idx_appointments_date_slot' AND object_id = OBJECT_ID('dbo.appointments')
    )
    CREATE UNIQUE INDEX idx_appointments_date_slot ON dbo.appointments([date], [slot])
  `);

  // Unavailable slots
  await run(`
    IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[unavailable_slots]') AND type = N'U')
    CREATE TABLE dbo.unavailable_slots (
      date NVARCHAR(16) NOT NULL,
      slot NVARCHAR(32) NOT NULL,
      CONSTRAINT PK_unavailable_slots PRIMARY KEY ([date], [slot])
    )
  `);

  // OTP + verifications
  await run(`
    IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[otps]') AND type = N'U')
    CREATE TABLE dbo.otps (
      id INT IDENTITY(1,1) PRIMARY KEY,
      contact NVARCHAR(32) NOT NULL,
      code NVARCHAR(10) NOT NULL,
      created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
      expires_at DATETIME2 NOT NULL,
      attempts INT NOT NULL DEFAULT 0,
      used BIT NOT NULL DEFAULT 0
    )
  `);
  await run(`
    IF NOT EXISTS (
      SELECT 1 FROM sys.indexes WHERE name = 'idx_otps_contact_created' AND object_id = OBJECT_ID('dbo.otps')
    )
    CREATE INDEX idx_otps_contact_created ON dbo.otps(contact, created_at)
  `);
  await run(`
    IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[verifications]') AND type = N'U')
    CREATE TABLE dbo.verifications (
      token NVARCHAR(128) NOT NULL PRIMARY KEY,
      contact NVARCHAR(32) NOT NULL,
      created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
      expires_at DATETIME2 NOT NULL
    )
  `);

  // Patients
  await run(`
    IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[patients]') AND type = N'U')
    CREATE TABLE dbo.patients (
      patient_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
      name NVARCHAR(200) NULL,
      contact NVARCHAR(32) NULL,
      email NVARCHAR(200) NULL,
      conditions NVARCHAR(MAX) NULL,
      goal NVARCHAR(MAX) NULL,
      notes NVARCHAR(MAX) NULL,
      height_cm FLOAT NULL,
      weight_kg FLOAT NULL,
      age INT NULL,
      sex NVARCHAR(20) NULL,
      activity NVARCHAR(50) NULL,
      diet_pref NVARCHAR(50) NULL,
      allergies NVARCHAR(MAX) NULL,
      patient_uid NVARCHAR(64) NULL,
      created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
      updated_at DATETIME2 NULL,
      goal_tags NVARCHAR(MAX) NULL,
      goal_notes NVARCHAR(MAX) NULL
    )
  `);
  await run(`
    IF NOT EXISTS (
      SELECT 1 FROM sys.indexes WHERE name = 'idx_patients_uid' AND object_id = OBJECT_ID('dbo.patients')
    )
    CREATE UNIQUE INDEX idx_patients_uid ON dbo.patients(patient_uid)
  `);
  await run(`
    IF NOT EXISTS (
      SELECT 1 FROM sys.indexes WHERE name = 'idx_patients_contact' AND object_id = OBJECT_ID('dbo.patients')
    )
    CREATE INDEX idx_patients_contact ON dbo.patients(contact)
  `);
  await run(`
    IF NOT EXISTS (
      SELECT 1 FROM sys.indexes WHERE name = 'idx_patients_email' AND object_id = OBJECT_ID('dbo.patients')
    )
    CREATE INDEX idx_patients_email ON dbo.patients(email)
  `);

  // Prescriptions
  await run(`
    IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[prescriptions]') AND type = N'U')
    CREATE TABLE dbo.prescriptions (
      id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
      patient_id INT NOT NULL,
      content NVARCHAR(MAX) NOT NULL,
      created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
      updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
      CONSTRAINT FK_prescriptions_patients
        FOREIGN KEY (patient_id) REFERENCES dbo.patients(patient_id) ON DELETE CASCADE
    )
  `);
  await run(`
    IF NOT EXISTS (
      SELECT 1 FROM sys.indexes WHERE name = 'idx_prescriptions_patient_id' AND object_id = OBJECT_ID('dbo.prescriptions')
    )
    CREATE INDEX idx_prescriptions_patient_id ON dbo.prescriptions(patient_id)
  `);
}

function getDb() {
  return Promise.resolve({ run, get, all });
}

module.exports = { init, getDb };