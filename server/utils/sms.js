async function sendSms(contact, message) {
  // TODO: integrate with SMS provider (Twilio/MSG91/etc.)
  console.log(`[SMS] to ${contact}: ${message}`);
  return true;
}

module.exports = { sendSms };
