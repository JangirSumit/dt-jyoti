import React, { useEffect, useMemo, useState } from 'react';
import {
  Paper, Typography, Grid, TextField, Box, Chip, Table, TableHead, TableRow, TableCell,
  TableBody, Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, Tooltip, InputAdornment
} from '@mui/material';

// Diagnosis tags
const CONDITION_TAGS = [
  'Diabetes', 'Hypertension', 'PCOS', 'Hypothyroid', 'Hyperthyroid', 'Obesity',
  'Anemia', 'High Cholesterol', 'Fatty Liver', 'GERD', 'IBS', 'Gout',
  'Arthritis', 'Migraine', 'Kidney Stone', 'Pregnancy', 'Postpartum'
];

// Quick-pick tags for minimal typing
const SEX_TAGS = ['Female', 'Male', 'Other'];
const ACTIVITY_TAGS = ['Sedentary', 'Light', 'Moderate', 'Active', 'Athlete'];
const DIET_TAGS = ['Veg', 'Non-veg', 'Vegan', 'Jain', 'Eggetarian'];
const ALLERGY_TAGS = ['Milk', 'Peanut', 'Soy', 'Gluten', 'Shellfish', 'Egg', 'Tree nuts'];
// ADD: Goals quick-picks
const GOAL_TAGS = ['Weight loss','Weight gain','Muscle gain','Diabetes control','Cholesterol management','Thyroid management','PCOS management','Digestive health','General wellness','Postpartum nutrition'];

function parseDate(d) {
  const [y, m, day] = (d || '').split('-').map(Number);
  return new Date(y, (m || 1) - 1, day || 1).getTime() || 0;
}

export default function AdminPatients() {
  const [appointments, setAppointments] = useState([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);

  // Patient meta
  const [patientMeta, setPatientMeta] = useState({
    conditions: [],
    height_cm: '', weight_kg: '', age: '',
    sex: '', activity: '', diet_pref: '',
    allergies: [], patientId: '',
    goalTags: [], goalOther: '' // goalOther will map to goalNotes
  });
  const [loadingMeta, setLoadingMeta] = useState(false);
  const [savingMeta, setSavingMeta] = useState(false);

  const load = async () => {
    const token = localStorage.getItem('admintoken');
    const res = await fetch('/api/appointments', { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    if (res.ok) setAppointments(await res.json());
  };
  useEffect(() => { load(); }, []);

  // Open patient meta
  useEffect(() => {
    const fetchMeta = async () => {
      if (!selected) return;
      setLoadingMeta(true);
      try {
        const token = localStorage.getItem('admintoken');
        const idParam = selected.patientUid || selected.key; // prefer patient UID
        const res = await fetch(`/api/patients/${encodeURIComponent(idParam)}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const data = await res.json();
          setPatientMeta({
            conditions: Array.isArray(data.conditions) ? data.conditions : [],
            height_cm: data.height_cm ?? '',
            weight_kg: data.weight_kg ?? '',
            age: data.age ?? '',
            sex: data.sex ?? '',
            activity: data.activity ?? '',
            diet_pref: data.diet_pref ?? '',
            allergies: Array.isArray(data.allergies) ? data.allergies : [],
            patientId: data.patientId || selected.patientUid || '', // surface ID
            goalTags: Array.isArray(data.goalTags) ? data.goalTags : [],
            goalOther: data.goalNotes || ''
          });
        } else {
          setPatientMeta({
            conditions: [], height_cm: '', weight_kg: '', age: '',
            sex: '', activity: '', diet_pref: '', allergies: [], patientId: selected.patientUid || '',
            goalTags: [], goalOther: ''
          });
        }
      } catch {
        setPatientMeta({
          conditions: [], height_cm: '', weight_kg: '', age: '',
          sex: '', activity: '', diet_pref: '', allergies: [], patientId: selected.patientUid || '',
          goalTags: [], goalOther: ''
        });
      } finally {
        setLoadingMeta(false);
      }
    };
    fetchMeta();
  }, [selected]);

  // Helpers to toggle selections
  const toggleCondition = (tag) => {
    setPatientMeta((prev) => {
      const set = new Set(prev.conditions || []);
      set.has(tag) ? set.delete(tag) : set.add(tag);
      return { ...prev, conditions: Array.from(set) };
    });
  };
  const setSingle = (field, value) => {
    setPatientMeta((prev) => ({ ...prev, [field]: prev[field] === value ? '' : value }));
  };
  const toggleMulti = (field, tag) => {
    setPatientMeta((prev) => {
      const set = new Set(prev[field] || []);
      set.has(tag) ? set.delete(tag) : set.add(tag);
      return { ...prev, [field]: Array.from(set) };
    });
  };
  // Optional helper for goals (or use toggleMulti('goalTags', tag))
  const toggleGoal = (tag) => toggleMulti('goalTags', tag);

  const saveMeta = async () => {
    if (!selected) return;
    setSavingMeta(true);
    try {
      const token = localStorage.getItem('admintoken');
      const idParam = selected.patientUid || selected.key; // prefer patient UID
      const payload = {
        conditions: patientMeta.conditions,
        height_cm: patientMeta.height_cm,
        weight_kg: patientMeta.weight_kg,
        age: patientMeta.age,
        sex: patientMeta.sex,
        activity: patientMeta.activity,
        diet_pref: patientMeta.diet_pref,
        allergies: patientMeta.allergies,
        goalTags: patientMeta.goalTags,
        goalNotes: patientMeta.goalOther,
        name: selected.name, contact: selected.contact, email: selected.email
      };
      await fetch(`/api/patients/${encodeURIComponent(idParam)}/meta`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.error('Save meta failed', e);
    } finally {
      setSavingMeta(false);
    }
  };

  // Build unique patients (prefer patient_uid over contact/email)
  const patients = useMemo(() => {
    const map = new Map();
    for (const a of appointments) {
      const uid = (a.patient_uid || '').trim();
      const fallbackKey = (a.contact || a.email || '').trim();
      const key = uid || fallbackKey;
      if (!key) continue;

      const cur = map.get(key) || {
        key,                      // grouping key
        patientUid: uid || '',    // store uid explicitly
        name: a.name || '',
        contact: a.contact || '',
        email: a.email || '',
        appts: [],
      };
      cur.appts.push(a);
      if (!cur.patientUid && uid) cur.patientUid = uid; // upgrade when uid becomes available
      if (!cur.name && a.name) cur.name = a.name;
      if (!cur.email && a.email) cur.email = a.email;
      if (!cur.contact && a.contact) cur.contact = a.contact;
      map.set(key, cur);
    }

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
    return list.sort((a, b) => parseDate(b.lastDate) - parseDate(a.lastDate));
  }, [appointments]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter(p =>
      (p.name || '').toLowerCase().includes(q) ||
      (p.contact || '').toLowerCase().includes(q) ||
      (p.email || '').toLowerCase().includes(q) ||
      (p.patientUid || '').toLowerCase().includes(q)   // allow searching by Patient ID
    );
  }, [patients, query]);

  // BMI
  const h = Number(patientMeta.height_cm) || 0;
  const w = Number(patientMeta.weight_kg) || 0;
  const bmi = h > 0 && w > 0 ? (w / Math.pow(h / 100, 2)) : 0;
  const bmiText = bmi ? `${bmi.toFixed(1)} ${bmi < 18.5 ? '(Underweight)' : bmi < 25 ? '(Normal)' : bmi < 30 ? '(Overweight)' : '(Obese)'}` : '-';

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
              <TableCell>Patient ID</TableCell> {/* NEW */}
              <TableCell align="right">Appointments</TableCell>
              <TableCell>Last visit</TableCell>
              <TableCell>Last slot</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
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
                  <TableCell sx={{ fontFamily: 'mono', maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.patientUid || '-'}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title={`${p.paidCount} paid, ${p.unpaidCount} unpaid`}>
                      <span>{p.count}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell>{p.lastDate || '-'}</TableCell>
                  <TableCell>{p.lastSlot || '-'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ p: 2 }}>
          <Typography variant="h6" component="div" noWrap>Patient details</Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ overflowX: 'hidden' }}>
          {selected && (
            <Stack spacing={1.5}>
              <Stack spacing={0.5}>
                <Typography><strong>Name:</strong> {selected.name || '-'}</Typography>
                <Typography><strong>Contact:</strong> {selected.contact || '-'}</Typography>
                {selected.email ? <Typography><strong>Email:</strong> {selected.email}</Typography> : null}
                <Typography sx={{ color: 'text.secondary', fontSize: '0.8rem', wordBreak: 'break-all' }}>
                  Patient ID: {selected.patientUid || patientMeta.patientId || '-'}
                </Typography>
                <Typography><strong>Total appointments:</strong> {selected.count} ({selected.paidCount} paid, {selected.unpaidCount} unpaid)</Typography>
              </Stack>

              {/* Diagnosis tags */}
              <Box>
                <Typography sx={{ fontWeight: 600, mb: 1 }}>Diagnosis (select tags)</Typography>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  {CONDITION_TAGS.map(tag => {
                    const selectedTag = (patientMeta.conditions || []).includes(tag);
                    return (
                      <Chip
                        key={tag}
                        label={tag}
                        color={selectedTag ? 'primary' : 'default'}
                        variant={selectedTag ? 'filled' : 'outlined'}
                        onClick={() => toggleCondition(tag)}
                        sx={{ mb: 1 }}
                      />
                    );
                  })}
                </Stack>
              </Box>

              {/* Diet analysis basics */}
              <Box>
                <Typography sx={{ fontWeight: 600, mb: 1 }}>Diet analysis</Typography>
                <Grid container spacing={1.5}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      type="number"
                      fullWidth
                      size="small"
                      label="Height"
                      value={patientMeta.height_cm}
                      onChange={(e) => setPatientMeta(m => ({ ...m, height_cm: e.target.value }))}
                      InputProps={{ endAdornment: <InputAdornment position="end">cm</InputAdornment> }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      type="number"
                      fullWidth
                      size="small"
                      label="Weight"
                      value={patientMeta.weight_kg}
                      onChange={(e) => setPatientMeta(m => ({ ...m, weight_kg: e.target.value }))}
                      InputProps={{ endAdornment: <InputAdornment position="end">kg</InputAdornment> }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      type="number"
                      fullWidth
                      size="small"
                      label="Age"
                      value={patientMeta.age}
                      onChange={(e) => setPatientMeta(m => ({ ...m, age: e.target.value }))}
                      InputProps={{ endAdornment: <InputAdornment position="end">yrs</InputAdornment> }}
                    />
                  </Grid>
                </Grid>

                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
                  {SEX_TAGS.map(t => (
                    <Chip
                      key={t}
                      label={t}
                      color={patientMeta.sex === t ? 'primary' : 'default'}
                      variant={patientMeta.sex === t ? 'filled' : 'outlined'}
                      onClick={() => setSingle('sex', t)}
                      sx={{ mb: 1 }}
                    />
                  ))}
                </Stack>

                <Typography sx={{ mt: 1, fontWeight: 600 }}>Activity</Typography>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 0.5 }}>
                  {ACTIVITY_TAGS.map(t => (
                    <Chip
                      key={t}
                      label={t}
                      color={patientMeta.activity === t ? 'primary' : 'default'}
                      variant={patientMeta.activity === t ? 'filled' : 'outlined'}
                      onClick={() => setSingle('activity', t)}
                      sx={{ mb: 1 }}
                    />
                  ))}
                </Stack>

                <Typography sx={{ mt: 1, fontWeight: 600 }}>Diet preference</Typography>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 0.5 }}>
                  {DIET_TAGS.map(t => (
                    <Chip
                      key={t}
                      label={t}
                      color={patientMeta.diet_pref === t ? 'primary' : 'default'}
                      variant={patientMeta.diet_pref === t ? 'filled' : 'outlined'}
                      onClick={() => setSingle('diet_pref', t)}
                      sx={{ mb: 1 }}
                    />
                  ))}
                </Stack>

                <Typography sx={{ mt: 1, fontWeight: 600 }}>Allergies</Typography>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 0.5 }}>
                  {ALLERGY_TAGS.map(t => {
                    const on = (patientMeta.allergies || []).includes(t);
                    return (
                      <Chip
                        key={t}
                        label={t}
                        color={on ? 'primary' : 'default'}
                        variant={on ? 'filled' : 'outlined'}
                        onClick={() => toggleMulti('allergies', t)}
                        sx={{ mb: 1 }}
                      />
                    );
                  })}
                </Stack>

                <Typography sx={{ mt: 1, color: 'text.secondary' }}>
                  BMI: {bmiText}
                </Typography>
              </Box>

              {/* ADD: Goals */}
              <Box>
                <Typography sx={{ fontWeight: 600, mb: 1 }}>Goals (select and/or type)</Typography>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  {GOAL_TAGS.map(t => {
                    const on = (patientMeta.goalTags || []).includes(t);
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
                  value={patientMeta.goalOther}
                  onChange={(e) => setPatientMeta(prev => ({ ...prev, goalOther: e.target.value }))}
                />
              </Box>

              {/* Appointment history */}
              <Box sx={{ mt: 1 }}>
                <Typography sx={{ fontWeight: 600, mb: 0.5 }}>Appointments</Typography>
                <Paper variant="outlined" sx={{ p: 1 }}>
                  <Stack spacing={0.5}>
                    {selected.appts.map(ap => (
                      <Stack key={ap.id} direction="row" spacing={1} alignItems="center" sx={{ fontSize: '0.9rem' }}>
                        <Typography sx={{ minWidth: 110 }}>{ap.date}</Typography>
                        <Typography sx={{ minWidth: 90 }}>{ap.slot}</Typography>
                        <Typography sx={{ flex: 1, color: 'text.secondary' }}>{ap.id}</Typography>
                        {ap.paid ? <Chip label="Paid" color="success" size="small" /> : null}
                      </Stack>
                    ))}
                  </Stack>
                </Paper>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)}>Close</Button>
          <Button onClick={saveMeta} disabled={savingMeta} variant="contained">
            {savingMeta ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
