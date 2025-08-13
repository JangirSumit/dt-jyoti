import React, { useState } from 'react';
import { Paper, Typography, Grid, TextField, Button } from '@mui/material';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (!res.ok) { setError('Invalid credentials'); return; }
    const data = await res.json();
    localStorage.setItem('admintoken', data.token);
    window.location.href = '/admin/appointments';
  };
  return (
    <Paper sx={{ p: 3, maxWidth: 420, mx: 'auto', mt: 6 }}>
      <Typography variant="h5" gutterBottom>Admin Login</Typography>
      <form onSubmit={submit}>
        <Grid container spacing={2}>
          <Grid item xs={12}><TextField label="Username" name="username" value={form.username} onChange={onChange} fullWidth required /></Grid>
          <Grid item xs={12}><TextField label="Password" name="password" type="password" value={form.password} onChange={onChange} fullWidth required /></Grid>
          {error && <Grid item xs={12}><Typography color="error">{error}</Typography></Grid>}
          <Grid item xs={12}><Button type="submit" variant="contained" fullWidth>Login</Button></Grid>
        </Grid>
      </form>
    </Paper>
  );
}
