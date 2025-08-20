const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.prod') });
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { init } = require('./db');

// FIX: import routers as default exports (functions)
const appointmentsRouterM = require('./routes/appointments');
const otpRouterM = require('./routes/otp');
const paymentsRouterM = require('./routes/payments');
const patientsRouterM = require('./routes/patients');
const prescriptionsRouterM = require('./routes/prescriptions');
const aiRouterM = require('./routes/ai');

const asRouter = (m, name) => {
  const r = (m && m.default) ? m.default : m;
  if (typeof r !== 'function') {
    console.error(`Invalid export from ${name}:`, { type: typeof r });
    throw new TypeError(`Router "${name}" must export a function (express.Router)`);
  }
  return r;
};

const appointmentsRouter = asRouter(appointmentsRouterM, 'appointments');
const otpRouter = asRouter(otpRouterM, 'otp');
const paymentsRouter = asRouter(paymentsRouterM, 'payments');
const patientsRouter = asRouter(patientsRouterM, 'patients');
const prescriptionsRouter = asRouter(prescriptionsRouterM, 'prescriptions');
const aiRouter = asRouter(aiRouterM, 'ai');

(async () => {
  await init();

  const app = express();
  app.use(cors());
  app.use(express.json()); // once is enough

  app.get('/health', (_req, res) => {
    res.json({
      ok: true,
      hasTwilio: Boolean(
        process.env.TWILIO_ACCOUNT_SID &&
        process.env.TWILIO_AUTH_TOKEN &&
        process.env.TWILIO_FROM
      ),
      time: new Date().toISOString()
    });
  });

  app.get('/twilio-check', (_req, res) => {
    const sid = process.env.TWILIO_ACCOUNT_SID || '';
    const token = process.env.TWILIO_AUTH_TOKEN || '';
    const from = process.env.TWILIO_FROM || '';
    res.json({
      hasTwilio: Boolean(sid && token && from),
      sidPrefix: sid.slice(0, 4),
      sidLength: sid.length,
      tokenLength: token.length,
      from
    });
  });

  if (!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM)) {
    console.error('Missing Twilio env. Check server/.env');
  }

  // Routers
  app.use('/api/payments', paymentsRouter);
  app.use('/api/appointments', appointmentsRouter);
  app.use('/api/otp', otpRouter);
  app.use('/api/patients', patientsRouter);
  app.use('/api/prescriptions', prescriptionsRouter);
  app.use('/api/ai', aiRouter);                        // FIXED

  const port = Number(process.env.PORT || 4000);
  console.log('[Twilio configured]', {
    sid: !!process.env.TWILIO_ACCOUNT_SID,
    token: !!process.env.TWILIO_AUTH_TOKEN,
    sender: !!(process.env.TWILIO_FROM || process.env.TWILIO_MESSAGING_SERVICE_SID)
  });
  app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
})();
