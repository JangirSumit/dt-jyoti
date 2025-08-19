const { Router, raw } = require('express'); // drop json
const crypto = require('crypto');
const { getDb } = require('../db');

const router = Router();

// REMOVE: /razorpay/order and /razorpay/verify endpoints

// Keep only the webhook to mark Payment Link payments as paid
router.post('/razorpay/webhook', raw({ type: 'application/json' }), async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) return res.status(500).end();

    const signature = req.header('x-razorpay-signature') || '';
    const body = req.body; // Buffer (because express.raw)

    const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
    if (expected !== signature) return res.status(400).end();

    const event = JSON.parse(body.toString('utf8'));
    const db = await getDb();

    if (event.event === 'payment_link.paid') {
      const pl = event.payload.payment_link.entity;
      const linkId = pl.id;
      const paymentId = (pl.payments && pl.payments[0] && pl.payments[0].id) || null;

      const appt = await db.get(`SELECT * FROM appointments WHERE payment_link_id = ?`, linkId);
      if (appt && !appt.paid) {
        await db.run(
          `UPDATE appointments
             SET paid = 1,
                 payment_id = ?,
                 payment_amount = ?,
                 payment_currency = ?,
                 paid_at = ?
           WHERE id = ?`,
          paymentId,
          pl.amount || null,
          pl.currency || 'INR',
          new Date().toISOString(),
          appt.id
        );
      }
    }

    return res.json({ received: true });
  } catch (e) {
    console.error('webhook error', e);
    res.status(500).end();
  }
});

module.exports = { paymentsRouter: router };