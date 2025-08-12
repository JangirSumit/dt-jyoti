import React, { useMemo, useState } from 'react';
import { Paper, Typography, Grid, TextField, MenuItem, Button, Divider, Chip, Box, List, ListItem, ListItemText } from '@mui/material';
import Banner from '../components/Banner';
import { generatePlan } from '../utils/aiPlanner';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function AIPlans() {
  useDocumentTitle('AI Diet Planner');
  const [form, setForm] = useState({
    age: 30,
    gender: 'female',
    heightCm: 165,
    weightKg: 65,
    activity: 'light',
    goal: 'maintain',
    cuisine: 'indian',
    veg: true,
  });
  const plan = useMemo(() => generatePlan(form), [form]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === 'age' || name.includes('Cm') || name.includes('Kg') ? Number(value) : value }));
  };
  const setPreset = (goal) => setForm((f) => ({ ...f, goal }));

  return (
    <>
      <Banner src="/images/ai/hero-diet.svg" alt="AI Diet Planner" />
  <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h4" gutterBottom>AI-powered Diet Plan</Typography>
            <Typography variant="body1" color="text.secondary">
              Balanced daily plan with calories, macros, and meal ideas—generated instantly using safe, rule-based defaults crafted by a dietitian.
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip label="Lose weight" variant={form.goal==='lose'?'filled':'outlined'} color="primary" onClick={()=> setPreset('lose')} />
              <Chip label="Maintain" variant={form.goal==='maintain'?'filled':'outlined'} color="primary" onClick={()=> setPreset('maintain')} />
              <Chip label="Gain muscle" variant={form.goal==='gain'?'filled':'outlined'} color="primary" onClick={()=> setPreset('gain')} />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              <Grid item xs={6}><TextField label="Age" name="age" type="number" fullWidth value={form.age} onChange={onChange} /></Grid>
              <Grid item xs={6}>
                <TextField label="Gender" name="gender" select fullWidth value={form.gender} onChange={onChange}>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="male">Male</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={6}><TextField label="Height (cm)" name="heightCm" type="number" fullWidth value={form.heightCm} onChange={onChange} /></Grid>
              <Grid item xs={6}><TextField label="Weight (kg)" name="weightKg" type="number" fullWidth value={form.weightKg} onChange={onChange} /></Grid>
              <Grid item xs={6}>
                <TextField label="Activity" name="activity" select fullWidth value={form.activity} onChange={onChange}>
                  <MenuItem value="sedentary">Sedentary</MenuItem>
                  <MenuItem value="light">Light</MenuItem>
                  <MenuItem value="moderate">Moderate</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="very_active">Very Active</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField label="Goal" name="goal" select fullWidth value={form.goal} onChange={onChange}>
                  <MenuItem value="lose">Lose weight</MenuItem>
                  <MenuItem value="maintain">Maintain</MenuItem>
                  <MenuItem value="gain">Gain muscle/weight</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField label="Cuisine" name="cuisine" select fullWidth value={form.cuisine} onChange={onChange}>
                  <MenuItem value="indian">Indian</MenuItem>
                  <MenuItem value="continental">Continental</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField label="Preference" name="veg" select fullWidth value={form.veg} onChange={(e)=> setForm((f)=> ({...f, veg: e.target.value === true || e.target.value === 'true'}))}>
                  <MenuItem value={true}>Vegetarian</MenuItem>
                  <MenuItem value={false}>Non-vegetarian</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Daily Targets</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                <Chip color="success" label={`${plan.calories} kcal`} />
                <Chip label={`Protein ${plan.proteinG} g`} />
                <Chip label={`Carbs ${plan.carbsG} g`} />
                <Chip label={`Fat ${plan.fatG} g`} />
              </Box>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle1" gutterBottom>Meals</Typography>
              <List dense>
                {plan.meals.map((m, i) => (
                  <ListItem key={i} alignItems="flex-start">
                    <ListItemText
                      primary={m.name}
                      secondary={m.items.join(', ')}
                    />
                  </ListItem>
                ))}
              </List>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button variant="contained" sx={{ mt: 1 }} onClick={()=> navigator.clipboard.writeText(JSON.stringify(plan, null, 2))}>Copy Plan JSON</Button>
                <Button variant="outlined" sx={{ mt: 1 }} href="/appointment">Book a consultation</Button>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 2, borderRadius: 2, background: 'linear-gradient(90deg, #f1f8e9, #e3f2fd)' }}>
              <Typography variant="subtitle2" color="text.secondary">
                Note: This AI plan is a general guide and not a substitute for medical advice. For clinical conditions, consult directly for a personalized plan.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </>
  );
}
