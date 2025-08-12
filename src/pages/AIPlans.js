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

  const toText = (p) => {
    const lines = [];
    lines.push('AI Diet Plan');
    lines.push('');
    lines.push(`Goal: ${form.goal}`);
    lines.push(`Cuisine: ${form.cuisine}${form.veg ? ' • Vegetarian' : ''}`);
    lines.push(`Calories: ${p.calories} kcal`);
    lines.push(`Macros: Protein ${p.proteinG} g • Carbs ${p.carbsG} g • Fat ${p.fatG} g`);
    lines.push('');
    lines.push('Meals:');
    p.meals.forEach((m, i) => {
      lines.push(`  ${i + 1}. ${m.name}`);
      lines.push(`     - ${m.items.join(', ')}`);
    });
    lines.push('');
    lines.push('AI-generated draft — better to consult directly for personalized advice.');
    try {
      lines.push(`Generated from: ${window.location.origin}`);
    } catch {}
    return lines.join('\n');
  };

  const handleDownloadTxt = () => {
    const content = toText(plan);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diet-plan-${form.goal}-${form.cuisine}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const wrapText = (ctx, text, x, y, maxWidth, lineHeight) => {
    const words = text.split(' ');
    let line = '';
    let cursorY = y;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, x, cursorY);
        line = words[n] + ' ';
        cursorY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), x, cursorY);
    return cursorY + lineHeight;
  };

  const handleDownloadPng = () => {
    const width = 1080;
    const height = 1350;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const grd = ctx.createLinearGradient(0, 0, width, height);
    grd.addColorStop(0, '#eef7f5');
    grd.addColorStop(1, '#f2f7fb');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, width, height);

    const pad = 64;
    const maxTextWidth = width - pad * 2;
    let y = pad + 24;

    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 56px Inter, Arial, Helvetica, sans-serif';
    ctx.fillText('AI Diet Plan', pad, y);
    y += 48 + 16;

    ctx.font = '400 28px Inter, Arial, Helvetica, sans-serif';
    y = wrapText(ctx, `Goal: ${form.goal}  •  Cuisine: ${form.cuisine}${form.veg ? ' • Vegetarian' : ''}`, pad, y, maxTextWidth, 38);
    y = wrapText(ctx, `Calories: ${plan.calories} kcal`, pad, y, maxTextWidth, 38);
    y = wrapText(ctx, `Macros: Protein ${plan.proteinG} g  •  Carbs ${plan.carbsG} g  •  Fat ${plan.fatG} g`, pad, y, maxTextWidth, 38);
    y += 16;

    ctx.font = '600 34px Inter, Arial, Helvetica, sans-serif';
    ctx.fillText('Meals', pad, y);
    y += 34 + 8;
    ctx.font = '400 28px Inter, Arial, Helvetica, sans-serif';
    plan.meals.forEach((m, i) => {
      y = wrapText(ctx, `${i + 1}. ${m.name}`, pad, y, maxTextWidth, 36);
      y = wrapText(ctx, `• ${m.items.join(', ')}`, pad + 24, y, maxTextWidth - 24, 36);
      y += 8;
    });

    y += 8;
  ctx.font = 'italic 22px Inter, Arial, Helvetica, sans-serif';
  ctx.fillStyle = '#6b7280';
  wrapText(ctx, 'AI-generated draft — better to consult directly for personalized advice.', pad, Math.min(y, height - 120), maxTextWidth, 32);

  // Footer with site origin
  let origin = '';
  try { origin = window.location.origin; } catch {}
  ctx.textAlign = 'center';
  ctx.font = '400 22px Inter, Arial, Helvetica, sans-serif';
  ctx.fillText(origin ? `Generated from ${origin}` : 'Generated from website', width / 2, height - 36);

    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `diet-plan-${form.goal}-${form.cuisine}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

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
                <Button variant="contained" sx={{ mt: 1 }} onClick={handleDownloadTxt}>Download Plan (TXT)</Button>
                <Button variant="outlined" sx={{ mt: 1 }} onClick={handleDownloadPng}>Download Card (PNG)</Button>
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
