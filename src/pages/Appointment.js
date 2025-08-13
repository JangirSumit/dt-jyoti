import React, { useEffect, useState } from 'react';
import { Paper, Typography, Grid, TextField, Select, MenuItem, Button, Snackbar, Alert, Box, IconButton } from '@mui/material';
import Banner from '../components/Banner';
import useDocumentTitle from '../hooks/useDocumentTitle';
import DeleteIcon from '@mui/icons-material/Delete';
import SEO from '../components/SEO';

export default function Appointment() {
  useDocumentTitle('Appointment');
  const [booking, setBooking] = useState({ name: '', contact: '', email: '', date: '', slot: '' });
  const [appointments, setAppointments] = useState([]);
  const [slotsForDate, setSlotsForDate] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchAppointments = async () => {
    const res = await fetch('/api/appointments');
    setAppointments(await res.json());
  };

  const fetchSlots = async (date) => {
    const res = await fetch(`/api/slots?date=${encodeURIComponent(date)}`);
    const data = await res.json();
    setSlotsForDate(Array.isArray(data.slots) ? data.slots : []);
  };

  useEffect(() => { fetchAppointments(); }, []);

  const onChange = async (e) => {
    const { name, value } = e.target;
    setBooking((b) => ({ ...b, [name]: value }));
    if (name === 'date' && value) await fetchSlots(value);
  };

  const submit = async (e) => {
    e.preventDefault();
  const { name, contact, date, slot } = booking;
  if (!name || !contact || !date || !slot) {
      setSnackbar({ open: true, message: 'Please fill all fields.', severity: 'error' });
      return;
    }
    const res = await fetch('/api/appointments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(booking) });
    if (res.status === 409) { setSnackbar({ open: true, message: 'Slot already booked.', severity: 'error' }); return; }
    if (!res.ok) { setSnackbar({ open: true, message: 'Booking failed.', severity: 'error' }); return; }
    const appt = await res.json();
  setAppointments((a) => [...a, appt]);
  setBooking({ name: '', contact: '', email: '', date: '', slot: '' });
    setSlotsForDate([]);
  setSnackbar({ open: true, message: 'Appointment booked! If you provided an email, a confirmation has been sent.', severity: 'success' });
  };

  const cancel = async (id) => {
    const res = await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
    if (!res.ok) { setSnackbar({ open: true, message: 'Failed to cancel.', severity: 'error' }); return; }
    setAppointments((a) => a.filter((x) => x.id !== id));
    setSnackbar({ open: true, message: 'Appointment canceled.', severity: 'success' });
  };

  return (
    <>
  <SEO title="Book Appointment – Dietitian Jyoti" description="See available slots and book your consultation online in seconds." canonical="/appointment" image="/images/banner-appointment.svg" />
    <Banner src="/images/banner-appointment.svg" alt="Appointment banner" />
  <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, boxShadow: 2 }}>
      <Typography variant="h4" gutterBottom>Book Appointment</Typography>
      <form onSubmit={submit}>
  <Grid container spacing={{ xs: 2, md: 2 }}>
          <Grid item xs={12} md={7}>
            <Grid container spacing={2}>
          <Grid item xs={12} sm={6}><TextField label="Name" name="name" value={booking.name} onChange={onChange} fullWidth required /></Grid>
          <Grid item xs={12} sm={6}><TextField label="Contact" name="contact" value={booking.contact} onChange={onChange} fullWidth required /></Grid>
          <Grid item xs={12} sm={6}><TextField label="Email (for confirmation)" name="email" type="email" value={booking.email} onChange={onChange} fullWidth /></Grid>
          <Grid item xs={12} sm={6}><TextField type="date" label="Date" name="date" value={booking.date} onChange={onChange} fullWidth required InputLabelProps={{ shrink: true }} /></Grid>
          <Grid item xs={12} sm={6}>
            <Select name="slot" value={booking.slot} onChange={onChange} fullWidth displayEmpty required>
              <MenuItem value=""><em>Select Slot</em></MenuItem>
              {booking.date && slotsForDate.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
          </Grid>
          <Grid item xs={12}><Button type="submit" variant="contained">Book</Button></Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} md={5}>
            <Box component="img" src="/images/fruits/bowl.svg" alt="Healthy bowl" sx={{ width: '100%', height: 'auto', borderRadius: 3, display: 'block' }} />
          </Grid>
        </Grid>
      </form>

      <Typography variant="h6" sx={{ mt: 3 }}>Upcoming Appointments</Typography>
      {appointments.length === 0 ? (
        <Typography>No appointments yet.</Typography>
      ) : (
        <Box>
          {appointments.map((a) => (
            <Paper key={a.id} sx={{ p: 1.5, my: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 2, boxShadow: 1 }}>
              <Typography><b>{a.name}</b> ({a.contact}) — {a.date} @ {a.slot}</Typography>
              <IconButton color="error" onClick={() => cancel(a.id)}><DeleteIcon /></IconButton>
            </Paper>
          ))}
        </Box>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
      </Paper>
    </>
  );
}
