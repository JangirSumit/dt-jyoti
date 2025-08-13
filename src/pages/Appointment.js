import React, { useState } from 'react';
import { Paper, Typography, Grid, TextField, Select, MenuItem, Button, Snackbar, Alert, Box, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import Banner from '../components/Banner';
import useDocumentTitle from '../hooks/useDocumentTitle';
import SEO from '../components/SEO';
import Section from '../components/Section';

export default function Appointment() {
  useDocumentTitle('Appointment');
  const [booking, setBooking] = useState({ name: '', contact: '', email: '', date: '', slot: '' });
  const [slotsForDate, setSlotsForDate] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [otpBusy, setOtpBusy] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);

  const fetchSlots = async (date) => {
    const res = await fetch(`/api/slots?date=${encodeURIComponent(date)}`);
    const data = await res.json();
    setSlotsForDate(Array.isArray(data.slots) ? data.slots : []);
  };

  // No public upcoming list to protect privacy

  const onChange = async (e) => {
    const { name, value } = e.target;
    setBooking((b) => ({ ...b, [name]: value }));
    if (name === 'date' && value) await fetchSlots(value);
  };

  const requestOtp = async () => {
    if (!booking.contact) { setSnackbar({ open: true, message: 'Enter contact number first.', severity: 'error' }); return; }
    try {
      setOtpBusy(true);
      const res = await fetch('/api/otp/request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contact: booking.contact }) });
      if (!res.ok) throw new Error('failed');
      setOtpSent(true);
      setSnackbar({ open: true, message: 'OTP sent. Please check your phone.', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Failed to send OTP. Try again later.', severity: 'error' });
    } finally {
      setOtpBusy(false);
    }
  };

  const verifyOtp = async () => {
    if (!otpCode) { setSnackbar({ open: true, message: 'Enter the OTP code.', severity: 'error' }); return; }
    try {
      setOtpBusy(true);
      const res = await fetch('/api/otp/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contact: booking.contact, code: otpCode }) });
      if (!res.ok) throw new Error('failed');
      const data = await res.json();
      setOtpToken(data.token || '');
      setSnackbar({ open: true, message: 'Mobile verified.', severity: 'success' });
      return true;
    } catch {
      setSnackbar({ open: true, message: 'Invalid OTP. Please try again.', severity: 'error' });
      return false;
    } finally {
      setOtpBusy(false);
    }
  };

  const createAppointment = async () => {
    const res = await fetch('/api/appointments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...booking, otpToken }) });
    if (res.status === 409) { setSnackbar({ open: true, message: 'Slot already booked.', severity: 'error' }); return false; }
    if (!res.ok) { setSnackbar({ open: true, message: 'Booking failed.', severity: 'error' }); return false; }
    await res.json();
    setBooking({ name: '', contact: '', email: '', date: '', slot: '' });
    setSlotsForDate([]);
    setOtpSent(false); setOtpCode(''); setOtpToken(''); setOtpOpen(false);
    setSnackbar({ open: true, message: 'Appointment booked! If you provided an email, a confirmation has been sent.', severity: 'success' });
    return true;
  };

  const submit = async (e) => {
    e.preventDefault();
  const { name, contact, date, slot } = booking;
  if (!name || !contact || !date || !slot) {
      setSnackbar({ open: true, message: 'Please fill all fields.', severity: 'error' });
      return;
    }
    if (!otpToken) {
      await requestOtp();
      setOtpOpen(true);
      return;
    }
    await createAppointment();
  };

  // —

  return (
    <>
  <SEO title="Book Appointment – Dietitian Jyoti" description="See available slots and book your consultation online in seconds." canonical="/appointment" image="/images/banner-appointment.svg" />
    <Banner src="/images/banner-appointment.svg" alt="Appointment banner" />
  <Section>
  <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, boxShadow: 2 }}>
      <Typography variant="h4" gutterBottom>Book Appointment</Typography>

      {/* Consultation hours (public, static) */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>Consultation hours</Typography>
        <Grid container spacing={1.5}>
          <Grid item xs={12} sm={6}>
            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
              <Typography>Mon–Sat: 10:00 AM – 6:00 PM</Typography>
              <Typography color="text.secondary">Sunday closed</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
              <Typography>In‑clinic & Online</Typography>
              <Typography color="text.secondary">Gurgaon • Video consults available</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
      <form onSubmit={submit}>
  <Grid container spacing={{ xs: 2, md: 2 }}>
          <Grid item xs={12} md={7}>
            <Grid container spacing={2}>
          <Grid item xs={12} sm={6}><TextField label="Name" name="name" value={booking.name} onChange={onChange} fullWidth required /></Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Contact" name="contact" value={booking.contact} onChange={onChange} fullWidth required />
          </Grid>
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

      {/* OTP Dialog */}
      <Dialog open={otpOpen} onClose={() => setOtpOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Verify your mobile</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 1 }}>
            We sent a 6‑digit code to {booking.contact}. Enter it below to confirm your booking.
          </Typography>
          <TextField
            autoFocus
            label="OTP"
            value={otpCode}
            onChange={(e)=> setOtpCode(e.target.value)}
            fullWidth
            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 6 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={requestOtp} disabled={otpBusy}>{otpSent ? 'Resend' : 'Send OTP'}</Button>
          <Button onClick={async ()=> { const ok = await verifyOtp(); if (ok) { await createAppointment(); } }} variant="contained" disabled={otpBusy || !otpCode}>Verify & Book</Button>
        </DialogActions>
      </Dialog>

  {/* Removed public list of other users' appointments to protect privacy */}

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Paper>
  </Section>
    </>
  );
}
