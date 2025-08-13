import React, { useEffect, useState } from 'react';
import { Paper, Typography, Grid, TextField, Button, MenuItem, Select, InputLabel, FormControl } from '@mui/material';

export default function AdminPrescriptions() {
  const [patients, setPatients] = useState([]);
  const [selected, setSelected] = useState('');
  const [content, setContent] = useState('');

  const load = async () => {
    const token = localStorage.getItem('admintoken');
    const res = await fetch('/api/patients', { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    setPatients(await res.json());
  };
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    if (!selected || !content) return;
    const token = localStorage.getItem('admintoken');
    const res = await fetch(`/api/patients/${selected}/prescriptions`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ content }) });
    if (res.ok) { setContent(''); alert('Saved'); }
  };

  return (
    <div>
      <Typography variant="h5" gutterBottom>Generate Prescription</Typography>
    <Paper sx={{ p: { xs: 1.5, md: 2 } }}>
        <form onSubmit={save}>
      <Grid container spacing={1.5}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="patient-label">Patient</InputLabel>
                <Select labelId="patient-label" label="Patient" value={selected} onChange={(e)=> setSelected(e.target.value)}>
                  {patients.map(p => <MenuItem key={p.id} value={p.id}>{p.name} — {p.contact}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField label="Prescription" value={content} onChange={(e)=> setContent(e.target.value)} fullWidth multiline rows={10} inputProps={{ style: { lineHeight: 1.35 } }} />
            </Grid>
            <Grid item xs={12}><Button type="submit" variant="contained">Save</Button></Grid>
          </Grid>
        </form>
      </Paper>
    </div>
  );
}
