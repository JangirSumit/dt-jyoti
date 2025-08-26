import React, { useEffect, useState } from 'react';
import { Paper, Typography, Grid, TextField, Select, MenuItem, Button, Snackbar, Alert, Box, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel } from '@mui/material';
import Banner from '../components/Banner';
import useDocumentTitle from '../hooks/useDocumentTitle';
import SEO from '../components/SEO';
import Section from '../components/Section';

export default function Appointment() {
  useDocumentTitle('Appointment');
  const getToday = () => {
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - tzOffset).toISOString().slice(0, 10);
  };
  const [booking, setBooking] = useState({ name: '', contact: '', email: '', date: (() => {
    try { return getToday(); } catch { return ''; }
  })(), slot: '' });
  const [slotsForDate, setSlotsForDate] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [otpBusy, setOtpBusy] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);
  const [createdAppt, setCreatedAppt] = useState(null);

  const fetchSlots = async (date) => {
    try {
      const res = await fetch(`/api/appointments/slots?date=${encodeURIComponent(date)}`);
      if (!res.ok) throw new Error('Failed to load slots');
      const data = await res.json();
      setSlotsForDate(Array.isArray(data.slots) ? data.slots : []);
    } catch (err) {
      console.warn('Fetch slots failed', err);
      setSlotsForDate([]);
    }
  };

  // Fetch slots for default date on mount
  useEffect(() => {
    if (booking.date) {
      fetchSlots(booking.date);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      if (!res.ok) {
        const err = await res.json().catch(()=>({}));
        throw new Error(err.error || 'failed');
      }
      setOtpSent(true);
      setSnackbar({ open: true, message: 'OTP sent. Please check your phone.', severity: 'success' });
    } catch (e) {
      setSnackbar({ open: true, message: 'Failed to send OTP. Try again later.', severity: 'error' });
    } finally {
      setOtpBusy(false);
    }
  };

  const verifyOtp = async () => {
    if (!otpCode) { setSnackbar({ open: true, message: 'Enter the OTP code.', severity: 'error' }); return ''; }
    try {
      setOtpBusy(true);
      const res = await fetch('/api/otp/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contact: booking.contact, code: otpCode }) });
      if (!res.ok) throw new Error('failed');
      const data = await res.json();
      setOtpToken(data.token || '');
      setSnackbar({ open: true, message: 'Mobile verified.', severity: 'success' });
      return data.token || '';
    } catch {
      setSnackbar({ open: true, message: 'Invalid OTP. Please try again.', severity: 'error' });
      return '';
    } finally {
      setOtpBusy(false);
    }
  };

  const createAppointment = async (tokenArg) => {
    const tokenToUse = tokenArg || otpToken;
    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-otp-token': tokenToUse }, // also send in header
      body: JSON.stringify({ ...booking, otpToken: tokenToUse })
    });
    if (res.status === 409) { setSnackbar({ open: true, message: 'Slot already booked.', severity: 'error' }); return false; }
    if (!res.ok) {
      const err = await res.json().catch(()=>({}));
      setSnackbar({ open: true, message: err.error || 'Booking failed.', severity: 'error' });
      return false;
    }
    const appointmentData = await res.json();
    setCreatedAppt(appointmentData); // Save the created appointment object
    const today = getToday();
    setBooking({ name: '', contact: '', email: '', date: today, slot: '' });
    await fetchSlots(today);
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
    await createAppointment(otpToken);
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
          <Grid item xs={12} sm={6}><TextField id="name" label="Name" name="name" value={booking.name} onChange={onChange} fullWidth required /></Grid>
          <Grid item xs={12} sm={6}>
            <TextField id="contact" label="Contact" name="contact" value={booking.contact} onChange={onChange} fullWidth required />
          </Grid>
          <Grid item xs={12} sm={6}><TextField id="email" label="Email (for confirmation)" name="email" type="email" value={booking.email} onChange={onChange} fullWidth /></Grid>
          <Grid item xs={12} sm={6}><TextField id="date" type="date" label="Date" name="date" value={booking.date} onChange={onChange} fullWidth required InputLabelProps={{ shrink: true }} /></Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel id="slot-label">Slot</InputLabel>
              <Select
                labelId="slot-label"
                id="slot"
                name="slot"
                value={booking.slot}
                onChange={onChange}
                label="Slot"
                displayEmpty
              >
                <MenuItem value=""><em>Select Slot</em></MenuItem>
                {booking.date && slotsForDate.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>
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
            id="otp"
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
          <Button
            onClick={async () => {
              const token = await verifyOtp();
              if (token) { await createAppointment(token); }
            }}
            variant="contained"
            disabled={otpBusy || !otpCode}
          >
            Verify & Book
          </Button>
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