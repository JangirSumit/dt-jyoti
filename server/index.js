const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

// In-memory store (replace with DB in production)
const state = {
  slots: [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'
  ],
  appointments: [] // {id, name, contact, date, slot}
};

// Get available slots for a date
app.get('/api/slots', (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'date is required' });
  const booked = state.appointments.filter(a => a.date === date).map(a => a.slot);
  const available = state.slots.filter(s => !booked.includes(s));
  res.json({ date, slots: available });
});

// List appointments
app.get('/api/appointments', (req, res) => {
  res.json(state.appointments);
});

// Create appointment
app.post('/api/appointments', (req, res) => {
  const { name, contact, date, slot } = req.body;
  if (!name || !contact || !date || !slot) {
    return res.status(400).json({ error: 'name, contact, date, slot are required' });
  }
  const clash = state.appointments.some(a => a.date === date && a.slot === slot);
  if (clash) return res.status(409).json({ error: 'Slot already booked' });
  const appt = { id: uuidv4(), name, contact, date, slot };
  state.appointments.push(appt);
  res.status(201).json(appt);
});

// Delete appointment
app.delete('/api/appointments/:id', (req, res) => {
  const { id } = req.params;
  const idx = state.appointments.findIndex(a => a.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const [removed] = state.appointments.splice(idx, 1);
  res.json(removed);
});

app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
