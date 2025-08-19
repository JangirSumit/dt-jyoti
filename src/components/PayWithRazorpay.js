import React from 'react';

function loadScript(src) {
  return new Promise((resolve) => {
    const s = document.createElement('script');
    s.src = src; s.onload = () => resolve(true); s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export default function PayWithRazorpay({ appointment, onSuccess, onError }) {
  const pay = async () => {
    const ok = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
    if (!ok) return onError?.(new Error('Failed to load Razorpay'));

    const res = await fetch('/api/payments/razorpay/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appointmentId: appointment.id }),
    });
    if (!res.ok) return onError?.(new Error('Order create failed'));
    const { key, orderId, amount, currency, customer } = await res.json();

    const rzp = new window.Razorpay({
      key,
      order_id: orderId,
      amount,
      currency,
      name: 'Dt. Jyoti',
      description: `Appointment ${appointment.date} ${appointment.slot}`,
      prefill: {
        name: customer?.name || appointment.name,
        email: customer?.email || appointment.email || '',
        contact: customer?.contact || appointment.contact,
      },
      notes: { appointmentId: appointment.id },
      handler: async (resp) => {
        try {
          // Verify signature with server
          const verify = await fetch('/api/payments/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: resp.razorpay_order_id,
              paymentId: resp.razorpay_payment_id,
              signature: resp.razorpay_signature,
            }),
          });
          if (!verify.ok) throw new Error('Verification failed');
          onSuccess?.(resp);
        } catch (e) {
          onError?.(e);
        }
      },
      theme: { color: '#ef6c00' },
    });

    rzp.open();
  };

  return (
    <button type="button" onClick={pay}>
      Pay now
    </button>
  );
}