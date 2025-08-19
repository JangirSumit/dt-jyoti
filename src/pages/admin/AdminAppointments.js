import React, { useEffect, useState } from 'react';
import { Paper, Typography, IconButton, Grid, Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [confirming, setConfirming] = useState(false); // ADD

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
    if (selected?.id === id) setSelected(null);
  };

  const openDetails = (a) => setSelected(a);
  const closeDetails = () => setSelected(null);

  const confirmBySms = async (id) => { // ADD
    try {
      setConfirming(true);
      const token = localStorage.getItem('admintoken');
      const res = await fetch(`/api/appointments/${id}/confirm-sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (!res.ok) throw new Error('Failed');
      // optional: show a toast/snackbar
    } catch (e) {
      console.error('Confirm SMS failed');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div>
      <Typography variant="h5" gutterBottom>Appointments</Typography>
      {appointments.length === 0 ? (
        <Typography>No appointments.</Typography>
      ) : (
        appointments.map((a) => (
          <Paper
            key={a.id}
            sx={{ p: { xs: 1.25, md: 1.5 }, my: 1, borderRadius: 2, cursor: 'pointer' }}
            onClick={() => openDetails(a)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && openDetails(a)}
          >
            <Grid container spacing={0.5} alignItems="center">
              <Grid item xs={10} md={11}>
                <Typography sx={{ fontWeight: 600, fontSize: { xs: '0.95rem', md: '1rem' }, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                  {a.name}
                </Typography>
                <Typography sx={{ color: 'text.secondary', fontSize: { xs: '0.85rem', md: '0.95rem' }, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                  {a.contact}{a.email ? ` • ${a.email}` : ''}
                </Typography>
                <Typography sx={{ fontSize: { xs: '0.85rem', md: '0.95rem' } }}>
                  {a.date} @ {a.slot} {a.paid ? '• Paid' : '• Unpaid'}
                </Typography>
              </Grid>
              <Grid item xs={2} md={1} sx={{ display: 'flex', justifyContent: { xs: 'flex-end', md: 'center' } }}>
                <IconButton
                  color="error"
                  aria-label={`Delete appointment for ${a.name}`}
                  size="small"
                  onClick={(e) => { e.stopPropagation(); cancel(a.id); }} // prevent opening modal
                >
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          </Paper>
        ))
      )}

      {/* Details modal */}
      <Dialog
        open={Boolean(selected)}
        onClose={closeDetails}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { overflow: 'hidden' } }}
      >
        <DialogTitle sx={{ p: 2, pr: 6, position: 'relative' }}>
          <Typography variant="h6" component="div" noWrap>
            Appointment details
          </Typography>
          <IconButton
            aria-label="Close"
            onClick={closeDetails}
            size="small"
            disableRipple
            disableFocusRipple
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'text.secondary',
              '&:hover': { backgroundColor: 'transparent', color: 'text.primary' },
              '&:focus-visible': { outline: 'none' }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ overflowX: 'hidden' }}> {/* hide horizontal scroll */}
          {selected && (
            <Stack spacing={0.75}>
              <Typography><strong>Name:</strong> {selected.name}</Typography>
              <Typography><strong>Contact:</strong> {selected.contact}</Typography>
              {selected.email ? <Typography><strong>Email:</strong> {selected.email}</Typography> : null}
              <Typography><strong>Date:</strong> {selected.date}</Typography>
              <Typography><strong>Slot:</strong> {selected.slot}</Typography>
              <Typography sx={{ color: 'text.secondary', fontSize: '0.8rem', wordBreak: 'break-all' }}>
                ID: {selected.id}
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          {selected && (
            <>
              <Button
                variant="contained"
                onClick={() => confirmBySms(selected.id)}
                disabled={confirming}
              >
                {confirming ? 'Sending…' : 'Confirm (Send link)'}
              </Button>
              <Button color="error" onClick={() => cancel(selected.id)}>
                Delete
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
}
