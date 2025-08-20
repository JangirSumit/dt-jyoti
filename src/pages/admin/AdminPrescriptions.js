import React, { useEffect, useState } from 'react';
import {
  Paper, Typography, Grid, TextField, Button,
  List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, Stack, Chip, Box
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
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);

  // New prescription
  const [content, setContent] = useState('');
  // ADD: diet plan state
  const defaultDietPlan = { morning: '', midMorning: '', lunch: '', teaTime: '', evening: '', dinner: '', bedTime: '' };
  const [dietPlan, setDietPlan] = useState(defaultDietPlan);

  // NEW: progressive section state and labels
  const DIET_ORDER = ['morning', 'midMorning', 'lunch', 'teaTime', 'evening', 'dinner', 'bedTime'];
  const DIET_LABELS = {
    morning: 'Morning',
    midMorning: 'Mid-morning',
    lunch: 'Lunch',
    teaTime: 'Tea time',
    evening: 'Evening',
    dinner: 'Dinner',
    bedTime: 'Bed time'
  };
  const [dietOpen, setDietOpen] = useState(['morning']);

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

  const hasDiet = Object.values(dietPlan).some(v => String(v || '').trim().length > 0);
  const buildDietPlanText = (plan) => {
    const sec = [];
    if (plan.morning) sec.push(`Morning: ${plan.morning}`);
    if (plan.midMorning) sec.push(`Mid-morning: ${plan.midMorning}`);
    if (plan.lunch) sec.push(`Lunch: ${plan.lunch}`);
    if (plan.teaTime) sec.push(`Tea time: ${plan.teaTime}`);
    if (plan.evening) sec.push(`Evening: ${plan.evening}`);
    if (plan.dinner) sec.push(`Dinner: ${plan.dinner}`);
    if (plan.bedTime) sec.push(`Bed time: ${plan.bedTime}`);
    return sec.length ? `Diet Plan\n${sec.join('\n')}` : '';
  };
  const buildFinalContent = () => {
    const note = content.trim();
    const diet = buildDietPlanText(dietPlan).trim();
    if (note && diet) return `${note}\n\n${diet}`;
    return note || diet;
  };

  // Save new prescription (diet plan only)
  const saveNew = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    const finalContent = buildFinalContent(); // diet-only now
    if (!finalContent) return;
    try {
      setSavingNew(true);
      // switched to a generic endpoint since patient selection is removed
      const res = await fetch(`/api/prescriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...tokenHeader() },
        body: JSON.stringify({ content: finalContent })
      });
      if (res.ok) {
        setContent('');
        setDietPlan(defaultDietPlan);
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
          onClick={() => { setDietOpen(['morning']); setNewOpen(true); }}
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

      {/* New prescription dialog */}
      <Dialog open={newOpen} onClose={() => setNewOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>New prescription</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={1.5}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mt: 0.5, mb: 0.5, fontWeight: 600 }}>
                Diet plan
              </Typography>
              <Stack spacing={1}>
                {dietOpen.map((key) => (
                  <TextField
                    key={key}
                    label={DIET_LABELS[key]}
                    fullWidth
                    multiline
                    minRows={2}
                    value={dietPlan[key]}
                    onChange={(e) => setDietPlan(p => ({ ...p, [key]: e.target.value }))}
                  />
                ))}
                {(() => {
                  const nextKey = DIET_ORDER.find(k => !dietOpen.includes(k));
                  return nextKey ? (
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ alignSelf: 'flex-start' }}
                      onClick={() => setDietOpen(prev => [...prev, nextKey])}
                    >
                      + {DIET_LABELS[nextKey]}
                    </Button>
                  ) : null;
                })()}
              </Stack>
            </Grid>

            {/* Preview */}
            <Grid item xs={12}>
              <Box sx={{ mt: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 0.5, color: 'text.secondary' }}>
                  Preview
                </Typography>
                <Paper variant="outlined" sx={{ p: 1 }}>
                  <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                    {buildDietPlanText(dietPlan) || 'Fill the diet plan to see a preview.'}
                  </Typography>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewOpen(false)} disabled={savingNew}>Cancel</Button>
          <Button
            onClick={saveNew}
            variant="contained"
            disabled={savingNew || !hasDiet}
          >
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
