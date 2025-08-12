// Simple API helper
export async function getSlots(date) {
  const res = await fetch(`/api/slots?date=${encodeURIComponent(date)}`);
  if (!res.ok) throw new Error('Failed to fetch slots');
  return res.json();
}

export async function listAppointments() {
  const res = await fetch('/api/appointments');
  if (!res.ok) throw new Error('Failed to fetch appointments');
  return res.json();
}

export async function createAppointment(payload) {
  const res = await fetch('/api/appointments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create appointment');
  return res.json();
}

export async function deleteAppointment(id) {
  const res = await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete appointment');
  return res.json();
}
