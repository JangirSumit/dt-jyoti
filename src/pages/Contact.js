import React from 'react';
import { Paper, Typography, TextField, Button, Grid, Snackbar, Alert, Box } from '@mui/material';
import Banner from '../components/Banner';
import useDocumentTitle from '../hooks/useDocumentTitle';
import SEO from '../components/SEO';
import Section from '../components/Section';

export default function Contact() {
  useDocumentTitle('Contact');
  const [form, setForm] = React.useState({ name: '', email: '', message: '' });
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' });
  const [submitting, setSubmitting] = React.useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    try {
      setSubmitting(true);
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed');
      setSnackbar({ open: true, message: 'Thanks! Your message has been sent.', severity: 'success' });
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Sorry, failed to send. Please try again later.', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
  <SEO title="Contact – Dietitian Jyoti" description="Have a question? Get in touch for clinic timings, online consults, or general queries." canonical="/contact" image="/images/banner-contact.svg" />
      <Banner src="/images/banner-contact.svg" alt="Contact banner" />
  <Section>
  <Paper sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h4" gutterBottom>Contact Me</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <form onSubmit={submit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}><TextField label="Name" name="name" value={form.name} onChange={onChange} fullWidth required /></Grid>
              <Grid item xs={12} sm={6}><TextField label="Email" name="email" type="email" value={form.email} onChange={onChange} fullWidth required /></Grid>
              <Grid item xs={12}><TextField label="Message" name="message" value={form.message} onChange={onChange} fullWidth multiline rows={4} required /></Grid>
              <Grid item xs={12}><Button type="submit" variant="contained" disabled={submitting}>{submitting ? 'Sending…' : 'Send'}</Button></Grid>
            </Grid>
          </form>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle1" gutterBottom>Clinic & Online</Typography>
            <Typography color="text.secondary">Gurgaon • Mon–Sat • 10:00 AM – 6:00 PM</Typography>
            <Box sx={{ mt: 2, height: 180, borderRadius: 2, overflow: 'hidden' }}>
              <Box component="img" src="/images/humans/client3.svg" alt="Clients" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </Box>
          </Paper>
        </Grid>
      </Grid>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Paper>
  </Section>
    </>
  );
}
