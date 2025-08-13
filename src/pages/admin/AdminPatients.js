import React, { useEffect, useState } from 'react';
import { Paper, Typography, Grid, TextField, Button, Box } from '@mui/material';

export default function AdminPatients() {
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({ name: '', contact: '', email: '', notes: '' });

  const load = async () => {
    const token = localStorage.getItem('admintoken');
    const res = await fetch('/api/patients', { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    setPatients(await res.json());
  };
  useEffect(() => { load(); }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const add = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('admintoken');
    const res = await fetch('/api/patients', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(form) });
    if (res.ok) { setForm({ name: '', contact: '', email: '', notes: '' }); load(); }
  };

  return (
    <div>
      <Typography variant="h5" gutterBottom>Patients</Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <form onSubmit={add}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}><TextField label="Name" name="name" value={form.name} onChange={onChange} fullWidth required /></Grid>
            <Grid item xs={12} md={3}><TextField label="Contact" name="contact" value={form.contact} onChange={onChange} fullWidth required /></Grid>
            <Grid item xs={12} md={3}><TextField label="Email" name="email" type="email" value={form.email} onChange={onChange} fullWidth /></Grid>
            <Grid item xs={12} md={3}><TextField label="Notes" name="notes" value={form.notes} onChange={onChange} fullWidth /></Grid>
            <Grid item xs={12}><Button type="submit" variant="contained">Add Patient</Button></Grid>
          </Grid>
        </form>
      </Paper>

      {patients.length === 0 ? <Typography>No patients.</Typography> : (
        <Box>
          {patients.map((p) => (
            <Paper key={p.id} sx={{ p: 1.5, my: 1, borderRadius: 2 }}>
              <Typography><b>{p.name}</b> — {p.contact}{p.email ? `, ${p.email}` : ''}</Typography>
              {p.notes && <Typography color="text.secondary">Notes: {p.notes}</Typography>}
            </Paper>
          ))}
        </Box>
      )}
    </div>
  );
}
