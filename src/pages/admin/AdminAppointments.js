import React, { useEffect, useState } from 'react';
import { Paper, Typography, Box, IconButton } from '@mui/material';
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
        <Paper key={a.id} sx={{ p: 1.5, my: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 2 }}>
          <Box>
            <Typography><b>{a.name}</b> ({a.contact}{a.email ? `, ${a.email}` : ''}) — {a.date} @ {a.slot}</Typography>
          </Box>
          <IconButton color="error" onClick={() => cancel(a.id)}><DeleteIcon /></IconButton>
        </Paper>
      ))}
    </div>
  );
}
