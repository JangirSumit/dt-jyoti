const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.prod') }); // load server/.env
require('dotenv').config(); // fallback to root if needed

const express = require('express');
const cors = require('cors');
const { init } = require('./db');
const { appointmentsRouter } = require('./routes/appointments');
const { otpRouter } = require('./routes/otp');
const { paymentsRouter } = require('./routes/payments'); // ADD

(async () => {
  await init();

  const app = express();
  app.use(cors());
  app.use(express.json()); // ADD: for normal JSON routes

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
      sidPrefix: sid.slice(0, 4),   // should be "AC"
      sidLength: sid.length,
      tokenLength: token.length,    // typically 32
      from
    });
  });

  // Fail fast if Twilio not configured (comment out if you want soft behavior)
  if (!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM)) {
    console.error('Missing Twilio env. Check server/.env');
  }

  app.use('/api/appointments', appointmentsRouter);
  app.use('/api/otp', otpRouter);
  app.use('/api/payments', paymentsRouter); // ADD

  const port = Number(process.env.PORT || 4000);
  console.log('[Twilio configured]', {
    sid: !!process.env.TWILIO_ACCOUNT_SID,
    token: !!process.env.TWILIO_AUTH_TOKEN,
    sender: !!(process.env.TWILIO_FROM || process.env.TWILIO_MESSAGING_SERVICE_SID)
  });
  app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
})();
