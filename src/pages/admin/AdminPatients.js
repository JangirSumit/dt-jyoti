import React, { useEffect, useMemo, useState } from 'react';
import {
  Paper, Typography, Grid, TextField, Box, Chip, Table, TableHead, TableRow, TableCell,
  TableBody, Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, Tooltip
} from '@mui/material';

function parseDate(d) {
  // expects YYYY-MM-DD
  const [y, m, day] = (d || '').split('-').map(Number);
  return new Date(y, (m || 1) - 1, day || 1).getTime() || 0;
}

export default function AdminPatients() {
  const [appointments, setAppointments] = useState([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);

  const load = async () => {
    const token = localStorage.getItem('admintoken');
    const res = await fetch('/api/appointments', { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    if (res.ok) setAppointments(await res.json());
  };

  useEffect(() => { load(); }, []);

  // Build patient list from appointments
  const patients = useMemo(() => {
    const map = new Map();
    for (const a of appointments) {
      const key = (a.contact || a.email || '').trim();
      if (!key) continue;
      const cur = map.get(key) || {
        key,
        name: a.name || '',
        contact: a.contact || '',
        email: a.email || '',
        appts: [],
      };
      cur.appts.push(a);
      // prefer the most recent non-empty name/email
      if (!cur.name && a.name) cur.name = a.name;
      if (!cur.email && a.email) cur.email = a.email;
      map.set(key, cur);
    }
    // enrich stats
    const list = Array.from(map.values()).map(p => {
      const sorted = [...p.appts].sort((x, y) => parseDate(y.date) - parseDate(x.date));
      const last = sorted[0];
      const paidCount = sorted.filter(x => x.paid).length;
      return {
        ...p,
        count: p.appts.length,
        lastDate: last?.date || '',
        lastSlot: last?.slot || '',
        lastPaid: !!last?.paid,
        paidCount,
        unpaidCount: p.appts.length - paidCount,
        appts: sorted,
      };
    });
    // sort by most recent visit
    return list.sort((a, b) => parseDate(b.lastDate) - parseDate(a.lastDate));
  }, [appointments]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter(p =>
      (p.name || '').toLowerCase().includes(q) ||
      (p.contact || '').toLowerCase().includes(q) ||
      (p.email || '').toLowerCase().includes(q)
    );
  }, [patients, query]);

  return (
    <div>
      <Typography variant="h5" gutterBottom>Patients</Typography>

      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <TextField
            size="small"
            fullWidth
            label="Search patients (name, contact, email)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md="auto">
          <Stack direction="row" spacing={1} alignItems="center" sx={{ height: '100%' }}>
            <Chip label={`Total: ${patients.length}`} />
            <Chip label={`With unpaid: ${patients.filter(p => p.unpaidCount > 0).length}`} color="warning" variant="outlined" />
          </Stack>
        </Grid>
        <Grid item xs />
        <Grid item>
          <Button variant="outlined" size="small" onClick={load}>Refresh</Button>
        </Grid>
      </Grid>

      <Paper sx={{ p: 0, overflow: 'hidden' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Patient</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Email</TableCell>
              <TableCell align="right">Appointments</TableCell>
              <TableCell>Last visit</TableCell>
              <TableCell>Last slot</TableCell>
              {/* Removed Status column */}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography sx={{ py: 2, textAlign: 'center' }}>No patients found.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(p => (
                <TableRow
                  key={p.key}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => setSelected(p)}
                >
                  <TableCell sx={{ maxWidth: 240, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <Typography sx={{ fontWeight: 600 }}>{p.name || '-'}</Typography>
                  </TableCell>
                  <TableCell>{p.contact || '-'}</TableCell>
                  <TableCell sx={{ maxWidth: 240, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.email || '-'}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title={`${p.paidCount} paid, ${p.unpaidCount} unpaid`}>
                      <span>{p.count}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell>{p.lastDate || '-'}</TableCell>
                  <TableCell>{p.lastSlot || '-'}</TableCell>
                  {/* Removed Status cell */}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ p: 2 }}>
          <Typography variant="h6" component="div" noWrap>
            Patient details
          </Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ overflowX: 'hidden' }}>
          {selected && (
            <Stack spacing={1}>
              <Typography><strong>Name:</strong> {selected.name || '-'}</Typography>
              <Typography><strong>Contact:</strong> {selected.contact || '-'}</Typography>
              {selected.email ? <Typography><strong>Email:</strong> {selected.email}</Typography> : null}
              <Typography><strong>Total appointments:</strong> {selected.count} ({selected.paidCount} paid, {selected.unpaidCount} unpaid)</Typography>

              <Box sx={{ mt: 1 }}>
                <Typography sx={{ fontWeight: 600, mb: 0.5 }}>Appointments</Typography>
                <Paper variant="outlined" sx={{ p: 1 }}>
                  <Stack spacing={0.5}>
                    {selected.appts.map(ap => (
                      <Stack key={ap.id} direction="row" spacing={1} alignItems="center" sx={{ fontSize: '0.9rem' }}>
                        <Typography sx={{ minWidth: 110 }}>{ap.date}</Typography>
                        <Typography sx={{ minWidth: 90 }}>{ap.slot}</Typography>
                        <Typography sx={{ flex: 1, color: 'text.secondary' }}>{ap.id}</Typography>
                        {ap.paid ? (
                          <Chip label="Paid" color="success" size="small" />
                        ) : null}
                      </Stack>
                    ))}
                  </Stack>
                </Paper>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)} variant="contained">Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
