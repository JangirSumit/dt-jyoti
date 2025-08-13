import React, { useMemo, useState } from 'react';
import { Paper, Typography, Grid, TextField, MenuItem, Button, Box } from '@mui/material';
import Banner from '../components/Banner';
import useDocumentTitle from '../hooks/useDocumentTitle';
import Section from '../components/Section';

function calcBMI(weightKg, heightCm) {
  if (!weightKg || !heightCm) return null;
  const h = heightCm / 100;
  return +(weightKg / (h * h)).toFixed(1);
}

function calcBMR({ sex, weightKg, heightCm, age }) {
  if (!sex || !weightKg || !heightCm || !age) return null;
  const s = sex === 'male' ? 5 : -161;
  return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + s);
}

function suggestCalories(goal, activity, bmr) {
  if (!bmr) return null;
  const factors = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725 };
  let tdee = bmr * (factors[activity] || 1.2);
  if (goal === 'loss') tdee -= 500;
  if (goal === 'gain') tdee += 300;
  return Math.max(1200, Math.round(tdee));
}

function generatePlan(calories) {
  if (!calories) return [];
  const meals = [
    { name: 'Breakfast', pct: 0.25 },
    { name: 'Snack', pct: 0.1 },
    { name: 'Lunch', pct: 0.3 },
    { name: 'Snack', pct: 0.1 },
    { name: 'Dinner', pct: 0.25 }
  ];
  return meals.map(m => ({ ...m, calories: Math.round(m.pct * calories) }));
}

export default function Calculator() {
  useDocumentTitle('BMI / BMR Calculator');
  const [form, setForm] = useState({ sex: 'female', age: '', heightCm: '', weightKg: '', activity: 'light', goal: 'loss' });
  const [plan, setPlan] = useState([]);

  const bmi = useMemo(() => calcBMI(+form.weightKg, +form.heightCm), [form]);
  const bmr = useMemo(() => calcBMR({ sex: form.sex, weightKg: +form.weightKg, heightCm: +form.heightCm, age: +form.age }), [form]);
  const calories = useMemo(() => suggestCalories(form.goal, form.activity, bmr), [form, bmr]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onGenerate = () => setPlan(generatePlan(calories));

  return (
    <>
      <Banner src="/images/banner-calculator.svg" alt="Calculator banner" />
  <Section>
  <Paper sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>BMI / BMR Calculator</Typography>
      <Grid container spacing={2}>
  <Grid item xs={12} sm={4}><TextField id="calc-sex" select label="Sex" name="sex" value={form.sex} onChange={onChange} fullWidth>
          <MenuItem value="female">Female</MenuItem><MenuItem value="male">Male</MenuItem></TextField></Grid>
  <Grid item xs={12} sm={4}><TextField id="calc-age" label="Age" name="age" value={form.age} onChange={onChange} type="number" fullWidth /></Grid>
  <Grid item xs={12} sm={4}><TextField id="calc-height" label="Height (cm)" name="heightCm" value={form.heightCm} onChange={onChange} type="number" fullWidth /></Grid>
  <Grid item xs={12} sm={4}><TextField id="calc-weight" label="Weight (kg)" name="weightKg" value={form.weightKg} onChange={onChange} type="number" fullWidth /></Grid>
  <Grid item xs={12} sm={4}><TextField id="calc-activity" select label="Activity" name="activity" value={form.activity} onChange={onChange} fullWidth>
          <MenuItem value="sedentary">Sedentary</MenuItem>
          <MenuItem value="light">Light</MenuItem>
          <MenuItem value="moderate">Moderate</MenuItem>
          <MenuItem value="active">Active</MenuItem>
        </TextField></Grid>
  <Grid item xs={12} sm={4}><TextField id="calc-goal" select label="Goal" name="goal" value={form.goal} onChange={onChange} fullWidth>
          <MenuItem value="loss">Lose Weight</MenuItem>
          <MenuItem value="maintain">Maintain</MenuItem>
          <MenuItem value="gain">Gain Muscle</MenuItem>
        </TextField></Grid>
        <Grid item xs={12}><Button variant="contained" onClick={onGenerate}>Generate Diet Plan</Button></Grid>
      </Grid>

      <Box sx={{ mt: 2 }}>
        <Typography>BMI: {bmi ?? '—'}</Typography>
        <Typography>BMR: {bmr ?? '—'} kcal/day</Typography>
        <Typography>Suggested daily calories: {calories ?? '—'} kcal</Typography>
      </Box>

      {plan.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6">Suggested Meal Split</Typography>
          {plan.map((m, i) => (
            <Typography key={i}>{m.name}: {m.calories} kcal</Typography>
          ))}
        </Box>
      )}
  </Paper>
  </Section>
    </>
  );
}
