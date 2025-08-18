const twilio = require('twilio');

let twilioClient = null;

function normalizePhone(raw) {
  const cc = (process.env.SMS_DEFAULT_COUNTRY_CODE || '+91').replace(/\s/g, '');
  let d = String(raw || '').replace(/\D/g, '');
  if (!d) return '';
  if (d.startsWith('0')) d = d.slice(1);
  if (d.startsWith('+')) return d;
  if (d.startsWith('91') && d.length === 12) return '+' + d;
  if (d.length === 10) return (cc.startsWith('+') ? cc : '+' + cc) + d;
  return '+' + d;
}

function getClient() {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;
  if (!twilioClient && TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  }
  return twilioClient;
}

async function sendSms(to, body) {
  const cli = getClient();
  const toE164 = normalizePhone(to);
  const from = (process.env.TWILIO_FROM || '').trim();

  if (!cli || !from) {
    const why = !cli ? 'missing TWILIO_ACCOUNT_SID/AUTH_TOKEN' : 'missing TWILIO_FROM';
    console.warn('[SMS] Twilio not configured:', why);
    console.log('[SMS Fallback]', toE164, body);
    return false;
  }

  try {
    const msg = await cli.messages.create({
      to: toE164,
      from,
      body: String(body || '').slice(0, 700),
      statusCallback: process.env.TWILIO_STATUS_CALLBACK_URL || undefined
    });
    if (process.env.SMS_DEBUG) console.log('[SMS] queued', msg.sid, 'to', toE164, `(from ${from})`);
    return true;
  } catch (e) {
    console.error('[SMS] failed:', e.code, e.message);
    return false;
  }
}

module.exports = { sendSms, normalizePhone };

