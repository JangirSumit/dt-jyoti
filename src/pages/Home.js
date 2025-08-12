import React from 'react';
import { Box, Typography, Paper, Grid, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export default function Home() {
  return (
    <Box>
      <Paper elevation={3} sx={{ p: 4, mb: 3, background: 'linear-gradient(135deg,#e8f5e9,#e0f7fa)' }}>
        <Typography variant="h3" gutterBottom>Dietitian Jyoti</Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Personalized nutrition plans, appointment booking, and wellness tracking.
        </Typography>
        <Button variant="contained" color="primary" component={RouterLink} to="/appointment" sx={{ mt: 2 }}>
          Book an Appointment
        </Button>
      </Paper>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Evidence-based plans</Typography>
            <Typography variant="body2">Tailored diet plans for diabetes, PCOD, thyroid, weight loss, and more.</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Slot availability</Typography>
            <Typography variant="body2">Check open slots and book instantly online.</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">AI-assisted suggestions</Typography>
            <Typography variant="body2">Use our calculator to generate diet suggestions as per your goals.</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
