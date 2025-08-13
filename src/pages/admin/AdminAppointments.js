import React, { useEffect, useState } from 'react';
import { Paper, Typography, IconButton, Grid } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const load = async () => {
  const token = localStorage.getItem('admintoken');
  const res = await fetch('/api/appointments', { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    setAppointments(await res.json());
  };
  useEffect(() => { load(); }, []);
  const cancel = async (id) => {
    const token = localStorage.getItem('admintoken');
    const res = await fetch(`/api/appointments/${id}`, { method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : {} });
    if (res.ok) setAppointments((a) => a.filter((x) => x.id !== id));
  };
  return (
    <div>
      <Typography variant="h5" gutterBottom>Appointments</Typography>
      {appointments.length === 0 ? <Typography>No appointments.</Typography> : appointments.map((a) => (
        <Paper key={a.id} sx={{ p: { xs: 1.25, md: 1.5 }, my: 1, borderRadius: 2 }}>
          <Grid container spacing={0.5} alignItems="center">
            <Grid item xs={10} md={11}>
              <Typography sx={{ fontWeight: 600, fontSize: { xs: '0.95rem', md: '1rem' }, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{a.name}</Typography>
              <Typography sx={{ color: 'text.secondary', fontSize: { xs: '0.85rem', md: '0.95rem' }, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                {a.contact}{a.email ? ` • ${a.email}` : ''}
              </Typography>
              <Typography sx={{ fontSize: { xs: '0.85rem', md: '0.95rem' } }}>{a.date} @ {a.slot}</Typography>
            </Grid>
            <Grid item xs={2} md={1} sx={{ display: 'flex', justifyContent: { xs: 'flex-end', md: 'center' } }}>
              <IconButton color="error" onClick={() => cancel(a.id)} aria-label={`Delete appointment for ${a.name}`} size="small"><DeleteIcon /></IconButton>
            </Grid>
          </Grid>
        </Paper>
      ))}
    </div>
  );
}
