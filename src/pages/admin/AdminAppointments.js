import React, { useEffect, useState } from 'react';
import { Paper, Typography, IconButton, Grid, Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, Box, Chip, TextField, InputAdornment, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';

const CONDITION_TAGS = [
  'Diabetes','Hypertension','PCOS','Hypothyroid','Hyperthyroid','Obesity',
  'Anemia','High Cholesterol','Fatty Liver','GERD','IBS','Gout','Arthritis',
  'Migraine','Kidney Stone','Pregnancy','Postpartum'
];
const SEX_TAGS = ['Female','Male','Other'];
const ACTIVITY_TAGS = ['Sedentary','Light','Moderate','Active','Athlete'];
const DIET_TAGS = ['Veg','Non-veg','Vegan','Jain','Eggetarian'];
const ALLERGY_TAGS = ['Milk','Peanut','Soy','Gluten','Shellfish','Egg','Tree nuts'];
const GOAL_TAGS = ['Weight loss','Weight gain','Muscle gain','Diabetes control','Cholesterol management','Thyroid management','PCOS management','Digestive health','General wellness','Postpartum nutrition'];

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [confirming, setConfirming] = useState(false);

  // Patient details editing inside modal
  const [editingDetails, setEditingDetails] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [savingDetails, setSavingDetails] = useState(false);
  const [details, setDetails] = useState({
    name: '', contact: '', email: '',
    height_cm: '', weight_kg: '', age: '',
    sex: '', activity: '', diet_pref: '',
    allergies: [], conditions: [],
    goalTags: [], goalOther: ''   // ADD
  });

  // New Prescription (diet-only) dialog state
  const defaultDietPlanRx = { morning: '', midMorning: '', lunch: '', teaTime: '', evening: '', dinner: '', bedTime: '' };
  const [rxNewOpen, setRxNewOpen] = useState(false);
  const [rxSavingNew, setRxSavingNew] = useState(false);
  const [rxDietPlan, setRxDietPlan] = useState(defaultDietPlanRx);

  // NEW: progressive section state and labels for the appointment RX dialog
  const RX_DIET_ORDER = ['morning', 'midMorning', 'lunch', 'teaTime', 'evening', 'dinner', 'bedTime'];
  const RX_DIET_LABELS = {
    morning: 'Morning',
    midMorning: 'Mid-morning',
    lunch: 'Lunch',
    teaTime: 'Tea time',
    evening: 'Evening',
    dinner: 'Dinner',
    bedTime: 'Bed time'
  };
  const [rxDietOpen, setRxDietOpen] = useState(['morning']);

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

  const openDetails = (a) => {
    setSelected(a);
    setEditingDetails(false);
  };
  const closeDetails = () => {
    setSelected(null);
    setEditingDetails(false);
  };

  const confirmBySms = async (id) => {
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
    } catch (e) {
      console.error('Confirm SMS failed');
    } finally {
      setConfirming(false);
    }
  };

  const toggleArray = (field, val) => {
    setDetails(b => {
      const set = new Set(b[field] || []);
      set.has(val) ? set.delete(val) : set.add(val);
      return { ...b, [field]: Array.from(set) };
    });
  };
  const toggleGoal = (tag) => {                 // ADD
    setDetails(b => {
      const set = new Set(b.goalTags || []);
      set.has(tag) ? set.delete(tag) : set.add(tag);
      return { ...b, goalTags: Array.from(set) };
    });
  };

  const beginAddDetails = async () => {
    if (!selected) return;
    setDetailsLoading(true);
    try {
      // Prefill from appointment
      const base = {
        name: selected.name || '',
        contact: selected.contact || '',
        email: selected.email || '',
        height_cm: '', weight_kg: '', age: '',
        sex: '', activity: '', diet_pref: '',
        allergies: [], conditions: []
      };

      // Load existing patient meta using contact/email as key
      const patientKey = (selected.contact || selected.email || '').trim();
      if (patientKey) {
        const token = localStorage.getItem('admintoken');
        const res = await fetch(`/api/patients/${encodeURIComponent(patientKey)}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const data = await res.json();
          setDetails({
            ...base,
            name: data.name || base.name,
            contact: data.contact || base.contact,
            email: data.email || base.email,
            conditions: Array.isArray(data.conditions) ? data.conditions : [],
            height_cm: data.height_cm ?? '',
            weight_kg: data.weight_kg ?? '',
            age: data.age ?? '',
            sex: data.sex ?? '',
            activity: data.activity ?? '',
            diet_pref: data.diet_pref ?? '',
            allergies: Array.isArray(data.allergies) ? data.allergies : [],
            goalTags: Array.isArray(data.goalTags) ? data.goalTags : [],
            goalOther: data.goalNotes || data.goal || '' // fallback to legacy
          });
        } else {
          setDetails({ ...base, goalTags: [], goalOther: '' });
        }
      } else {
        setDetails({ ...base, goalTags: [], goalOther: '' });
      }
      setEditingDetails(true);
    } catch (e) {
      console.error('Load patient details failed', e);
    } finally {
      setDetailsLoading(false);
    }
  };

  const savePatientDetails = async () => {
    if (!selected) return;
    const patientKey = (details.contact || details.email || '').trim();
    if (!patientKey) {
      console.error('Missing patient key (contact or email)');
      return;
    }

    setSavingDetails(true);
    try {
      // Ensure/get patientId
      const pRes = await fetch(`/api/patients/${encodeURIComponent(patientKey)}`);
      if (!pRes.ok) throw new Error('patient fetch failed');
      const pData = await pRes.json();
      const patientId = pData.patientId;

      // Save meta
      const putRes = await fetch(`/api/patients/${encodeURIComponent(patientKey)}/meta`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: details.name,
          contact: details.contact,
          email: details.email,
          conditions: details.conditions,
          height_cm: details.height_cm,
          weight_kg: details.weight_kg,
          age: details.age,
          sex: details.sex,
          activity: details.activity,
          diet_pref: details.diet_pref,
          allergies: details.allergies,
          goalTags: details.goalTags,
          goalNotes: details.goalOther
        })
      });
      if (!putRes.ok) throw new Error('meta save failed');

      // Best-effort link appointment to patientId if backend supports it
      try {
        await fetch(`/api/appointments/${selected.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patient_uid: patientId })
        });
      } catch {}

      // Update UI selection/collection
      setAppointments((list) =>
        list.map((a) => (a.id === selected.id ? { ...a, patient_uid: patientId } : a))
      );
      setSelected((prev) => (prev ? { ...prev, patient_uid: patientId } : prev));
      setEditingDetails(false);
    } catch (e) {
      console.error('Save patient details failed', e);
    } finally {
      setSavingDetails(false);
    }
  };

  const rxHasDiet = Object.values(rxDietPlan).some(v => String(v || '').trim().length > 0);
  const rxBuildDietPlanText = (plan) => {
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

  const openNewRxForAppointment = () => {
    setRxDietPlan(defaultDietPlanRx);
    setRxDietOpen(['morning']); // reset to only Morning visible
    setRxNewOpen(true);
  };

  const saveNewRxForAppointment = async () => {
    if (!selected) return;
    const finalContent = rxBuildDietPlanText(rxDietPlan).trim();
    if (!finalContent) return;

    // Use contact/email as the patient key like other patient APIs
    const patientKey = String(selected.contact || selected.email || '').trim();
    if (!patientKey) {
      // You can replace with a toast/snackbar if you have one
      alert('Missing patient contact or email to attach prescription.');
      return;
    }

    try {
      setRxSavingNew(true);
      // Ensure patient exists and get/generate an ID (optional but safe)
      await fetch(`/api/patients/${encodeURIComponent(patientKey)}`);

      // Create prescription for this patient (same as Add Prescription flow by patient)
      const res = await fetch(`/api/patients/${encodeURIComponent(patientKey)}/prescriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: finalContent })
      });
      if (res.ok) {
        setRxNewOpen(false);
        setRxDietPlan(defaultDietPlanRx);
      }
    } catch (e) {
      console.error('Create prescription failed', e);
    } finally {
      setRxSavingNew(false);
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
                  {a.date} @ {a.slot}
                  {!a.paid ? (
                    <Chip
                      label="Unpaid"
                      color="warning"
                      size="small"
                      variant="outlined"
                      sx={{ ml: 1, verticalAlign: 'middle' }}
                    />
                  ) : null}
                  {a.patient_uid ? (
                    <Tooltip title="Linked patient ID">
                      <Chip
                        label={a.patient_uid}
                        size="small"
                        variant="outlined"
                        sx={{ ml: 1, verticalAlign: 'middle' }}
                      />
                    </Tooltip>
                  ) : null}
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

        <DialogContent dividers sx={{ overflowX: 'hidden' }}>
          {selected && !editingDetails && (
            <Stack spacing={1}>
              {/* Buttons moved into modal body */}
              <Stack direction="row" spacing={1}>
                <Button size="small" variant="contained" onClick={openNewRxForAppointment}>
                  New prescription
                </Button>
                <Button size="small" onClick={beginAddDetails} disabled={detailsLoading}>
                  {detailsLoading ? 'Loading…' : 'Add details'}
                </Button>
              </Stack>

              {/* Existing appointment info */}
              <Stack spacing={0.75}>
                <Typography><strong>Name:</strong> {selected.name}</Typography>
                <Typography><strong>Contact:</strong> {selected.contact}</Typography>
                {selected.email ? <Typography><strong>Email:</strong> {selected.email}</Typography> : null}
                <Typography><strong>Date:</strong> {selected.date}</Typography>
                <Typography><strong>Slot:</strong> {selected.slot}</Typography>
                <Typography sx={{ color: 'text.secondary', fontSize: '0.8rem', wordBreak: 'break-all' }}>
                  ID: {selected.id}
                </Typography>
                {selected.patient_uid ? (
                  <Typography sx={{ color: 'text.secondary', fontSize: '0.8rem', wordBreak: 'break-all' }}>
                    Patient ID: {selected.patient_uid}
                  </Typography>
                ) : null}
              </Stack>
            </Stack>
          )}

          {selected && editingDetails && (
            <Stack spacing={1.5}>
              {detailsLoading ? <Typography>Loading…</Typography> : null}
              <Stack spacing={0.5}>
                <Typography sx={{ fontWeight: 600, mb: 0.5 }}>Patient</Typography>
                <Grid container spacing={1.5}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Name"
                      fullWidth
                      size="small"
                      value={details.name}
                      onChange={e => setDetails(b => ({ ...b, name: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Contact"
                      fullWidth
                      size="small"
                      value={details.contact}
                      onChange={e => setDetails(b => ({ ...b, contact: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Email"
                      fullWidth
                      size="small"
                      value={details.email}
                      onChange={e => setDetails(b => ({ ...b, email: e.target.value }))}
                    />
                  </Grid>
                </Grid>
              </Stack>

              {/* Height/Weight/Age */}
              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Height" size="small" fullWidth type="number"
                    value={details.height_cm}
                    onChange={e => setDetails(b => ({ ...b, height_cm: e.target.value }))}
                    InputProps={{ endAdornment: <InputAdornment position="end">cm</InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Weight" size="small" fullWidth type="number"
                    value={details.weight_kg}
                    onChange={e => setDetails(b => ({ ...b, weight_kg: e.target.value }))}
                    InputProps={{ endAdornment: <InputAdornment position="end">kg</InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Age" size="small" fullWidth type="number"
                    value={details.age}
                    onChange={e => setDetails(b => ({ ...b, age: e.target.value }))}
                    InputProps={{ endAdornment: <InputAdornment position="end">yrs</InputAdornment> }}
                  />
                </Grid>
              </Grid>

              {/* Sex */}
              <Box>
                <Typography sx={{ fontWeight: 600, mb: 1 }}>Sex</Typography>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  {SEX_TAGS.map(t => (
                    <Chip key={t}
                      label={t}
                      color={details.sex === t ? 'primary' : 'default'}
                      variant={details.sex === t ? 'filled' : 'outlined'}
                      onClick={() => setDetails(b => ({ ...b, sex: b.sex === t ? '' : t }))}
                    />
                  ))}
                </Stack>
              </Box>

              {/* Activity */}
              <Box>
                <Typography sx={{ fontWeight: 600, mb: 1 }}>Activity</Typography>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  {ACTIVITY_TAGS.map(t => (
                    <Chip key={t}
                      label={t}
                      color={details.activity === t ? 'primary' : 'default'}
                      variant={details.activity === t ? 'filled' : 'outlined'}
                      onClick={() => setDetails(b => ({ ...b, activity: b.activity === t ? '' : t }))}
                    />
                  ))}
                </Stack>
              </Box>

              {/* Diet preference */}
              <Box>
                <Typography sx={{ fontWeight: 600, mb: 1 }}>Diet preference</Typography>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  {DIET_TAGS.map(t => (
                    <Chip key={t}
                      label={t}
                      color={details.diet_pref === t ? 'primary' : 'default'}
                      variant={details.diet_pref === t ? 'filled' : 'outlined'}
                      onClick={() => setDetails(b => ({ ...b, diet_pref: b.diet_pref === t ? '' : t }))}
                    />
                  ))}
                </Stack>
              </Box>

              {/* Allergies */}
              <Box>
                <Typography sx={{ fontWeight: 600, mb: 1 }}>Allergies</Typography>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  {ALLERGY_TAGS.map(t => {
                    const on = (details.allergies || []).includes(t);
                    return (
                      <Chip key={t}
                        label={t}
                        color={on ? 'primary' : 'default'}
                        variant={on ? 'filled' : 'outlined'}
                        onClick={() => toggleArray('allergies', t)}
                      />
                    );
                  })}
                </Stack>
              </Box>

              {/* Diagnosis */}
              <Box>
                <Typography sx={{ fontWeight: 600, mb: 1 }}>Diagnosis</Typography>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  {CONDITION_TAGS.map(t => {
                    const on = (details.conditions || []).includes(t);
                    return (
                      <Chip key={t}
                        label={t}
                        color={on ? 'primary' : 'default'}
                        variant={on ? 'filled' : 'outlined'}
                        onClick={() => toggleArray('conditions', t)}
                      />
                    );
                  })}
                </Stack>
              </Box>

              {/* Goals */}
              <Box>
                <Typography sx={{ fontWeight: 600, mb: 1 }}>Goals (select and/or type)</Typography>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  {GOAL_TAGS.map(t => {
                    const on = (details.goalTags || []).includes(t);
                    return (
                      <Chip
                        key={t}
                        label={t}
                        color={on ? 'primary' : 'default'}
                        variant={on ? 'filled' : 'outlined'}
                        onClick={() => toggleGoal(t)}
                        sx={{ mb: 1 }}
                      />
                    );
                  })}
                </Stack>
                <TextField
                  label="Additional goal/notes"
                  placeholder="e.g., target 5kg loss in 3 months, improve energy"
                  fullWidth
                  size="small"
                  multiline
                  minRows={2}
                  value={details.goalOther}
                  onChange={e => setDetails(b => ({ ...b, goalOther: e.target.value }))}
                />
              </Box>

            </Stack>
          )}
        </DialogContent>

        <DialogActions>
          {selected && !editingDetails && (
            <>
              {/* Removed: New prescription and Add details from footer */}
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
          {selected && editingDetails && (
            <>
              <Button onClick={() => setEditingDetails(false)} disabled={savingDetails}>
                Cancel
              </Button>
              <Button variant="contained" onClick={savePatientDetails} disabled={savingDetails}>
                {savingDetails ? 'Saving…' : 'Save'}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* New prescription dialog (diet-only, same as Add Prescription UI) */}
      <Dialog open={rxNewOpen} onClose={() => setRxNewOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>New prescription for {selected?.name || 'patient'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={1.5}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mt: 0.5, mb: 0.5, fontWeight: 600 }}>
                Diet plan
              </Typography>
              <Stack spacing={1}>
                {rxDietOpen.map((key) => (
                  <TextField
                    key={key}
                    label={RX_DIET_LABELS[key]}
                    fullWidth
                    multiline
                    minRows={2}
                    value={rxDietPlan[key]}
                    onChange={(e) => setRxDietPlan(p => ({ ...p, [key]: e.target.value }))}
                  />
                ))}
                {(() => {
                  const nextKey = RX_DIET_ORDER.find(k => !rxDietOpen.includes(k));
                  return nextKey ? (
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ alignSelf: 'flex-start' }}
                      onClick={() => setRxDietOpen(prev => [...prev, nextKey])}
                    >
                      + {RX_DIET_LABELS[nextKey]}
                    </Button>
                  ) : null;
                })()}
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ mt: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 0.5, color: 'text.secondary' }}>
                  Preview
                </Typography>
                <Paper variant="outlined" sx={{ p: 1 }}>
                  <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                    {rxBuildDietPlanText(rxDietPlan) || 'Fill the diet plan to see a preview.'}
                  </Typography>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRxNewOpen(false)} disabled={rxSavingNew}>Cancel</Button>
          <Button
            onClick={saveNewRxForAppointment}
            variant="contained"
            disabled={rxSavingNew || !rxHasDiet}
          >
            {rxSavingNew ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Removed: New Appointment form from main screen */}
    </div>
  );
}
