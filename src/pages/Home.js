import React from 'react';
import { Box, Typography, Paper, Grid, Button, Card, CardContent, CardMedia, Stack } from '@mui/material';
import HeroBanner from '../components/HeroBanner';
import { Link as RouterLink } from 'react-router-dom';

export default function Home() {
  return (
    <Box>
      <HeroBanner
        title="Dietitian-led nutrition for real life"
        subtitle="Personalized plans, a smart calculator, and easy online bookings—built around your goals and routine."
        ctaText="Book Appointment"
        ctaTo="/appointment"
        imageSrc="/logo128.png"
      />

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ borderRadius: 3 }}>
            <CardMedia component="img" height="140" image="/logo64.png" alt="Plans" sx={{ objectFit: 'contain', p: 2 }} />
            <CardContent>
              <Typography variant="h6">Evidence-based plans</Typography>
              <Typography variant="body2" color="text.secondary">Tailored plans for diabetes, PCOD, thyroid, weight, and more.</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ borderRadius: 3 }}>
            <CardMedia component="img" height="140" image="/logo32.png" alt="Slots" sx={{ objectFit: 'contain', p: 2 }} />
            <CardContent>
              <Typography variant="h6">Slot availability</Typography>
              <Typography variant="body2" color="text.secondary">Check open slots and book instantly online.</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ borderRadius: 3 }}>
            <CardMedia component="img" height="140" image="/logo64.png" alt="AI" sx={{ objectFit: 'contain', p: 2 }} />
            <CardContent>
              <Typography variant="h6">AI-assisted suggestions</Typography>
              <Typography variant="body2" color="text.secondary">Use our calculator to generate diet suggestions for your goals.</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Testimonials */}
      <Box sx={{ mt: 5 }}>
        <Typography variant="h5" gutterBottom>What clients say</Typography>
        <Grid container spacing={2}>
          {[
            { q: 'Lost 7kg in 10 weeks, felt energetic all day!', n: 'Riya' },
            { q: 'My sugar levels are stable and meals are enjoyable.', n: 'Mahesh' },
            { q: 'Plans fit my busy schedule—sustainable and tasty.', n: 'Aisha' }
          ].map((t, i) => (
            <Grid item xs={12} md={4} key={i}>
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                  “{t.q}”
                </Typography>
                <Typography sx={{ mt: 1 }} color="text.secondary">— {t.n}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
