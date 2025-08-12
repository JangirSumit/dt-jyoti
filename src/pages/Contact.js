import React from 'react';
import { Paper, Typography, TextField, Button, Grid, Snackbar, Alert } from '@mui/material';
import Banner from '../components/Banner';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function Contact() {
  useDocumentTitle('Contact');
  const [form, setForm] = React.useState({ name: '', email: '', message: '' });
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' });

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = (e) => { e.preventDefault(); setSnackbar({ open: true, message: 'Thanks! We will get back to you.', severity: 'success' }); setForm({ name: '', email: '', message: '' }); };

  return (
    <>
      <Banner src="/images/banner-contact.svg" alt="Contact banner" />
      <Paper sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Contact Me</Typography>
      <form onSubmit={submit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}><TextField label="Name" name="name" value={form.name} onChange={onChange} fullWidth required /></Grid>
          <Grid item xs={12} sm={6}><TextField label="Email" name="email" type="email" value={form.email} onChange={onChange} fullWidth required /></Grid>
          <Grid item xs={12}><TextField label="Message" name="message" value={form.message} onChange={onChange} fullWidth multiline rows={4} required /></Grid>
          <Grid item xs={12}><Button type="submit" variant="contained">Send</Button></Grid>
        </Grid>
      </form>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
      </Paper>
    </>
  );
}
