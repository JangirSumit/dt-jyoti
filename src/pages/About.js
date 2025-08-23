import React, { useEffect, useRef } from 'react';
import { Typography, Paper, Grid, Box, Chip, Divider, Card, CardContent, Stack, Avatar, Tooltip } from '@mui/material';
import Button from '@mui/material/Button';
import useDocumentTitle from '../hooks/useDocumentTitle';
import SEO from '../components/SEO';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Section from '../components/Section';

export default function About() {
  useDocumentTitle('Our Team');
  const revealRef = useRef([]);
  useEffect(() => {
    const els = revealRef.current.filter(Boolean);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('reveal-in');
        });
      },
      { threshold: 0.2 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return (
    <>
  <SEO title="Our Team – GoNutriMind" description="Meet the GoNutriMind team — clinicians and nutrition experts delivering practical, evidence-based care." canonical="/about" image="/images/banner-about.svg" />

  {/* Hero */}
      <Section>
      <Paper className="reveal" ref={(el) => (revealRef.current[0] = el)} sx={{
        p: { xs: 3, md: 5 },
        borderRadius: 4,
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg,#e7f5ef,#e9f0fb)'
      }}>
        <Box sx={{ position: 'absolute', inset: 0, opacity: 0.5, pointerEvents: 'none' }}>
          <Box className="float-y-1" sx={{ position: 'absolute', top: -24, left: -24, width: 140, height: 140, borderRadius: '50%', filter: 'blur(26px)', background: 'radial-gradient(circle, rgba(76,175,80,.25), transparent 60%)' }} />
          <Box className="float-y-2" sx={{ position: 'absolute', bottom: -28, right: -28, width: 160, height: 160, borderRadius: '50%', filter: 'blur(28px)', background: 'radial-gradient(circle, rgba(33,150,243,.22), transparent 60%)' }} />
        </Box>
  <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={7}>
            <Stack spacing={1.5}>
              <Typography variant="overline" color="text.secondary">About Us</Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1.1 }}>GoNutriMind Team</Typography>
              <Typography variant="h6" color="text.secondary">
                GoNutriMind brings together clinical nutrition and practical guidance to help you build sustainable nutrition habits.
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip label="Evidence‑based" color="success" size="small" variant="outlined" />
                <Chip label="Client‑centric" size="small" variant="outlined" />
                <Chip label="In‑clinic & Online" size="small" variant="outlined" />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 1 }}>
                <Button variant="contained" size="large" href="/appointment">Book appointment</Button>
                <Button variant="outlined" size="large" href="/ai-plans" color="secondary">Explore AI plans</Button>
              </Stack>
            </Stack>
          </Grid>
          <Grid item xs={12} md={5}>
            <Stack alignItems="center" spacing={2}>
              <Avatar src="/images/humans/dietitian.svg" alt="GoNutriMind team" sx={{ width: 140, height: 140, border: '4px solid #fff', boxShadow: 2 }} />
              <Stack direction="row" spacing={1}>
                <Tooltip title="Years of practice"><Chip label="7+ yrs" /></Tooltip>
                <Tooltip title="Clients served"><Chip label="1000+ clients" /></Tooltip>
                <Tooltip title="Avg. rating"><Chip label="4.9/5" /></Tooltip>
              </Stack>
            </Stack>
          </Grid>
        </Grid>
  </Paper>
  </Section>

  {/* Team members */}
  <Section>
    <Typography variant="h4" sx={{ mt: 4, mb: 2, fontWeight: 800 }}>Our Team</Typography>
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Card elevation={2} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar src="/images/humans/dietitian.svg" alt="Dietitian Jyoti" sx={{ width: 80, height: 80 }} />
            <Box>
              <Typography sx={{ fontWeight: 800 }}>Dietitian Jyoti</Typography>
              <Typography color="text.secondary">Clinical Dietitian</Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card elevation={2} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ width: 80, height: 80 }}>T1</Avatar>
            <Box>
              <Typography sx={{ fontWeight: 800 }}>Team Member</Typography>
              <Typography color="text.secondary">Joining soon</Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card elevation={2} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ width: 80, height: 80 }}>T2</Avatar>
            <Box>
              <Typography sx={{ fontWeight: 800 }}>Team Member</Typography>
              <Typography color="text.secondary">Joining soon</Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  </Section>

      {/* Philosophy & Specialties */}
      <Grid container spacing={{ xs: 3, md: 4 }}>
  <Grid item xs={12} md={6} className="reveal" ref={(el) => (revealRef.current[1] = el)}>
          <Card elevation={2} sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>My philosophy</Typography>
              <Stack spacing={1.2}>
                {[ 'Nutrition that fits your life, not the other way around.', 'Small, consistent changes lead to sustainable results.', 'Education first—so you understand the why behind each step.', 'Flexible plans with Indian & world cuisines.' ].map((t) => (
                  <Stack key={t} direction="row" spacing={1} alignItems="flex-start">
                    <CheckCircleIcon color="success" fontSize="small" style={{ marginTop: 2 }} />
                    <Typography>{t}</Typography>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} className="reveal" ref={(el) => (revealRef.current[2] = el)}>
          <Card elevation={2} sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>Specialties</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {['Weight Management','Diabetes Care','PCOS/PCOD','Thyroid Health','Heart Health','Liver & Renal','Pregnancy & Lactation','Child & Teen','Digestive Health','Gluten‑free','Sports Nutrition'].map(t => <Chip key={t} label={t} />)}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

  {/* Approach steps */}
  <Section>
  <Paper className="reveal" ref={(el) => (revealRef.current[3] = el)} sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
        <Typography variant="h5" gutterBottom>How we’ll work together</Typography>
        <Grid container spacing={{ xs: 2, md: 3 }}>
          {[
            { n: '1', t: 'Assess', d: 'History, lifestyle, preferences, and labs (if applicable).' },
            { n: '2', t: 'Plan', d: 'Personalized meal plan with practical recipes and swaps.' },
            { n: '3', t: 'Coach', d: 'Portion guidance, habits, and mindful routines that stick.' },
            { n: '4', t: 'Review', d: 'Regular check-ins and adjustments to keep results on track.' }
          ].map((s) => (
            <Grid key={s.n} item xs={12} md={3}>
              <Card variant="outlined" elevation={0} sx={{ borderRadius: 3, height: '100%' }}>
                <CardContent>
                  <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: 'primary.main', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, mb: 1 }}>{s.n}</Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{s.t}</Typography>
                  <Typography color="text.secondary">{s.d}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
  </Paper>
  </Section>

  {/* Credentials compact */}
  <Section>
  <Paper className="reveal" ref={(el) => (revealRef.current[4] = el)} sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
        <Grid container spacing={{ xs: 2, md: 3 }}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>Education</Typography>
            <Typography>MSc – Dietetics & Nutrition</Typography>
            <Typography color="text.secondary">Amity University, Gurgaon (2014)</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>Experience</Typography>
            <Typography>Clinical Dietitian</Typography>
            <Typography color="text.secondary">Sir Ganga Ram Kolmet Hospital</Typography>
            <Divider sx={{ my: 1 }} />
            <Typography>Senior Nutritionist</Typography>
            <Typography color="text.secondary">Park Group of Hospitals</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>Memberships</Typography>
            <Typography>Indian Dietetic Association</Typography>
            <Divider sx={{ my: 1 }} />
            <Typography variant="h6" gutterBottom>Awards</Typography>
            <Typography>Best Dietitian – 2017</Typography>
          </Grid>
        </Grid>
  </Paper>
  </Section>
    </>
  );
}
