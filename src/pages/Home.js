import React from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, CardMedia, Divider } from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import Button from '@mui/material/Button';
import { Link as RouterLink } from 'react-router-dom';
import HeroBanner from '../components/HeroBanner';
import useDocumentTitle from '../hooks/useDocumentTitle';
import SEO from '../components/SEO';

export default function Home() {
  useDocumentTitle('Home');
  return (
    <Box>
  <SEO title="Dietitian Jyoti – Personalized Nutrition & Online Appointments" description="Clinical-grade diet plans, AI-assisted daily planning, and easy online appointments. Dietitian-led, practical nutrition." canonical="/" image="/images/banner-home.svg" />
      <HeroBanner
        title="Dietitian-led nutrition for real life"
        subtitle="Personalized plans, a smart calculator, and easy online bookings—built around your goals and routine."
        ctaText="Get AI Plan"
        ctaTo="/ai-plans"
        imageSrc="/images/ai/hero-diet.svg"
      />

  <Grid container spacing={{ xs: 2, md: 3 }}>
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ borderRadius: 3, height: '100%', transition: 'all .2s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 } }}>
            <CardMedia component="img" height="160" image="/images/fruits/bowl.svg" alt="Healthy bowl" sx={{ objectFit: 'cover' }} />
            <CardContent>
              <Typography variant="h6">Clinical-grade nutrition plans</Typography>
              <Typography variant="body2" color="text.secondary">Personalized protocols for diabetes, thyroid, PCOD, weight, and life stages.</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ borderRadius: 3, height: '100%', transition: 'all .2s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 } }}>
            <CardMedia component="img" height="160" image="/images/humans/client2.svg" alt="Happy clients" sx={{ objectFit: 'cover' }} />
            <CardContent>
              <Typography variant="h6">Seamless online scheduling</Typography>
              <Typography variant="body2" color="text.secondary">See real-time availability and book a consultation in seconds.</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ borderRadius: 3, height: '100%', transition: 'all .2s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 } }}>
            <CardMedia component="img" height="160" image="/images/ai/cards.svg" alt="AI" sx={{ objectFit: 'cover' }} />
            <CardContent>
              <Typography variant="h6">AI-assisted daily planning</Typography>
              <Typography variant="body2" color="text.secondary">Instant plans with calories, macros, and meal ideas—designed by a dietitian.</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Why choose Dt. Jyoti */}
  <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, mt: 5 }}>
        <Typography variant="h5" gutterBottom>Why choose Dt. Jyoti</Typography>
  <Grid container spacing={{ xs: 1.5, md: 2 }}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
              <VerifiedIcon color="success" />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Evidence-based care</Typography>
                <Typography color="text.secondary">Plans grounded in medical nutrition therapy and best practices.</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
              <FavoriteIcon color="secondary" />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Personal & practical</Typography>
                <Typography color="text.secondary">Culturally relevant meals, smart swaps, and portion guidance.</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
              <AccessTimeIcon color="primary" />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Designed for busy lives</Typography>
                <Typography color="text.secondary">Simple routines and reviews that help you stay consistent.</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
        <Divider sx={{ my: 2 }} />
  <Grid container spacing={{ xs: 1.5, md: 2 }}>
          {[
            { n: '1,000+', l: 'Clients served' },
            { n: '4.9/5', l: 'Average rating' },
            { n: '7+ yrs', l: 'Experience' },
          ].map((s, i) => (
            <Grid item xs={12} md={4} key={i}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>{s.n}</Typography>
                <Typography color="text.secondary">{s.l}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* AI Promo strip */}
      <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, mt: 4, background: 'linear-gradient(90deg, #e8f5e9, #e3f2fd)' }}>
        <Grid container alignItems="center" spacing={{ xs: 1.5, md: 2 }}>
          <Grid item xs={12} md={8}>
            <Typography variant="h5" sx={{ fontWeight: 700 }} gutterBottom>AI-powered. Dietitian-designed.</Typography>
            <Typography color="text.secondary">Get quick, sensible plans that follow nutrition best practices—customized to your stats and goals.</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
              <Button component={RouterLink} to="/ai-plans" variant="contained">Create My AI Plan</Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Testimonials */}
      <Box sx={{ mt: 5 }}>
        <Typography variant="h5" gutterBottom>What clients say</Typography>
  <Grid container spacing={{ xs: 2, md: 2 }}>
          {[
            { q: 'Lost 7kg in 10 weeks, felt energetic all day!', n: 'Riya', a: '/images/humans/client.svg' },
            { q: 'My sugar levels are stable and meals are enjoyable.', n: 'Mahesh', a: '/images/humans/client.svg' },
            { q: 'Plans fit my busy schedule—sustainable and tasty.', n: 'Aisha', a: '/images/humans/client.svg' }
          ].map((t, i) => (
      <Grid item xs={12} md={4} key={i}>
    <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, height: '100%' }}>
                <Box>
          <FormatQuoteIcon fontSize="small" color="disabled" />
          <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                    {t.q}
                  </Typography>
                  <Typography sx={{ mt: 1 }} color="text.secondary">— {t.n}</Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
