import React, { useEffect, useState } from 'react';
import {
  Paper, Typography, Grid, TextField, Button, MenuItem, Select, InputLabel, FormControl,
  List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, Stack, Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';

function formatDate(d) {
  try {
    const dt = new Date(d);
    if (!isFinite(dt)) return '-';
    return dt.toLocaleString();
  } catch { return '-'; }
}

export default function AdminPrescriptions() {
  const [patients, setPatients] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);

  // New prescription
  const [selectedPatient, setSelectedPatient] = useState('');
  const [content, setContent] = useState('');

  // View/Edit dialog
  const [rxOpen, setRxOpen] = useState(false);
  const [rxEditing, setRxEditing] = useState(false);
  const [rx, setRx] = useState(null);
  const [rxContent, setRxContent] = useState('');
  const [saving, setSaving] = useState(false);

  // ADD: new prescription dialog state
  const [newOpen, setNewOpen] = useState(false);
  const [savingNew, setSavingNew] = useState(false);

  const tokenHeader = () => {
    const token = localStorage.getItem('admintoken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const loadPatients = async () => {
    try {
      const res = await fetch('/api/patients', { headers: tokenHeader() });
      if (res.ok) setPatients(await res.json());
    } catch {}
  };

  const loadPrescriptions = async () => {
    setLoading(true);
    try {
      // Expecting an endpoint that returns all prescriptions
      // Each item ideally contains: id, content, created_at, patient info fields
      const res = await fetch('/api/prescriptions', { headers: tokenHeader() });
      if (res.ok) {
        const list = await res.json();
        // newest first
        setPrescriptions(
          Array.isArray(list)
            ? list.sort((a, b) => new Date(b.created_at || b.createdAt || 0) - new Date(a.created_at || a.createdAt || 0))
            : []
        );
      } else {
        setPrescriptions([]);
      }
    } catch {
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
    loadPrescriptions();
  }, []);

  const openRx = (item, edit = false) => {
    setRx(item);
    setRxContent(item?.content || '');
    setRxEditing(Boolean(edit));
    setRxOpen(true);
  };
  const closeRx = () => {
    setRxOpen(false);
    setRx(null);
    setRxEditing(false);
    setRxContent('');
  };

  // UPDATE: make submit usable from button (no event required)
  const saveNew = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!selectedPatient || !content.trim()) return;
    try {
      setSavingNew(true);
      const res = await fetch(`/api/patients/${encodeURIComponent(selectedPatient)}/prescriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...tokenHeader() },
        body: JSON.stringify({ content })
      });
      if (res.ok) {
        setContent('');
        await loadPrescriptions();
        setNewOpen(false);
      }
    } catch {} finally {
      setSavingNew(false);
    }
  };

  const updateRx = async () => {
    if (!rx?.id || !rxContent.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/prescriptions/${encodeURIComponent(rx.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...tokenHeader() },
        body: JSON.stringify({ content: rxContent })
      });
      if (res.ok) {
        await loadPrescriptions();
        closeRx();
      }
    } catch {} finally { setSaving(false); }
  };

  const deleteRx = async (id) => {
    if (!id) return;
    if (!window.confirm('Delete this prescription?')) return; // changed
    try {
      const res = await fetch(`/api/prescriptions/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: tokenHeader()
      });
      if (res.ok) {
        setPrescriptions(prev => prev.filter(x => x.id !== id));
      }
    } catch {}
  };

  const findPatientDisplay = (p) => {
    const name = p.patientName || p.name || p.patient?.name || 'Unknown';
    const contact = p.patientContact || p.contact || p.patient?.contact || '';
    const pid = p.patient_uid || p.patientId || p.patient?.patient_uid || '';
    return { name, contact, pid };
  };

  return (
    <div>
      {/* Header + New button */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Typography variant="h5">Prescriptions</Typography>
        <Button
          variant="contained"
          size="small"
          disableElevation
          sx={{
            flex: '0 0 auto',      // don't grow
            display: 'inline-flex',
            width: 'auto',         // prevent full-width
            minWidth: 0,
            px: 1,
            py: 0.25,
            fontSize: 12,
            lineHeight: 1.2,
            borderRadius: 1.5
          }}
          onClick={() => setNewOpen(true)}
        >
          New prescription
        </Button>
      </Stack>

      {/* Existing prescriptions list */}
      <Paper sx={{ p: { xs: 1, md: 1.5 }, mb: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>Existing prescriptions</Typography>
        {loading ? (
          <Typography sx={{ p: 1 }}>Loading…</Typography>
        ) : prescriptions.length === 0 ? (
          <Typography sx={{ p: 1, color: 'text.secondary' }}>No prescriptions yet.</Typography>
        ) : (
          <List dense disablePadding>
            {prescriptions.map((p, idx) => {
              const { name, contact, pid } = findPatientDisplay(p);
              const created = p.created_at || p.createdAt;
              const preview = String(p.content || '').slice(0, 140).replace(/\s+/g, ' ');
              return (
                <React.Fragment key={p.id || idx}>
                  <ListItem alignItems="flex-start">
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
                          <Typography sx={{ fontWeight: 600 }}>{name}</Typography>
                          {contact && <Typography sx={{ color: 'text.secondary' }}>• {contact}</Typography>}
                          {pid && (
                            <Chip size="small" variant="outlined" label={pid} sx={{ ml: 0.5 }} />
                          )}
                        </Stack>
                      }
                      secondary={
                        <>
                          <Typography sx={{ color: 'text.secondary' }}>{formatDate(created)}</Typography>
                          <Typography sx={{ mt: 0.25, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {preview}{preview.length >= 140 ? '…' : ''}
                          </Typography>
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Tooltip title="View">
                        <IconButton size="small" onClick={() => openRx(p, false)}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => openRx(p, true)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => deleteRx(p.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {idx < prescriptions.length - 1 ? <Divider component="li" /> : null}
                </React.Fragment>
              );
            })}
          </List>
        )}
      </Paper>

      {/* REMOVED: inline New prescription Paper form */}

      {/* New prescription dialog */}
      <Dialog open={newOpen} onClose={() => setNewOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>New prescription</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={1.5}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="patient-label">Patient</InputLabel>
                <Select
                  labelId="patient-label"
                  label="Patient"
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                >
                  {patients.map(p => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.name || 'Unnamed'} — {p.contact || p.email || ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Prescription"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                fullWidth
                multiline
                rows={10}
                inputProps={{ style: { lineHeight: 1.35 } }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewOpen(false)} disabled={savingNew}>Cancel</Button>
          <Button onClick={saveNew} variant="contained" disabled={savingNew || !selectedPatient || !content.trim()}>
            {savingNew ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View/Edit dialog (unchanged) */}
      <Dialog open={rxOpen} onClose={closeRx} fullWidth maxWidth="sm">
        <DialogTitle>{rxEditing ? 'Edit Prescription' : 'Prescription'}</DialogTitle>
        <DialogContent dividers>
          {rx ? (
            <Stack spacing={1}>
              <Typography sx={{ color: 'text.secondary' }}>
                {(() => {
                  const { name, contact, pid } = findPatientDisplay(rx);
                  return `${name}${contact ? ` • ${contact}` : ''}${pid ? ` • ${pid}` : ''}`;
                })()}
              </Typography>
              {rxEditing ? (
                <TextField
                  label="Prescription"
                  value={rxContent}
                  onChange={(e) => setRxContent(e.target.value)}
                  fullWidth
                  multiline
                  minRows={10}
                />
              ) : (
                <Paper variant="outlined" sx={{ p: 1 }}>
                  <Typography sx={{ whiteSpace: 'pre-wrap' }}>{rx.content}</Typography>
                </Paper>
              )}
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          {!rxEditing ? (
            <>
              <Button onClick={() => setRxEditing(true)}>Edit</Button>
              <Button onClick={closeRx} variant="contained">Close</Button>
            </>
          ) : (
            <>
              <Button onClick={() => setRxEditing(false)} disabled={saving}>Cancel</Button>
              <Button onClick={updateRx} variant="contained" disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
}
