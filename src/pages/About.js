import React, { useEffect, useRef } from 'react';
import { Typography, Paper, Grid, Box, Chip, Divider, Card, CardContent, Stack, Avatar, Tooltip } from '@mui/material';
import Button from '@mui/material/Button';
import useDocumentTitle from '../hooks/useDocumentTitle';
import SEO from '../components/SEO';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Section from '../components/Section';

export default function About() {
  useDocumentTitle('About');
  const revealRef = useRef([]);

  // Logos (served from /public/images)
  const logos = [
    { src: '/images/medanta.png', alt: 'Medanta' },
    { src: '/images/sgrh.png', alt: 'Sir Ganga Ram Hospital' },
    { src: '/images/park-hospital.png', alt: 'Park Hospital' },
    { src: '/images/ida.png', alt: 'Indian Dietetic Association' },
    { src: '/images/amity.png', alt: 'Amity University' }
  ];

  // NEW: split into three rows
  const affItems = [
    { logo: '/images/ida.png', org: 'Indian Dietetic Association', role: 'Member', tag: 'Affiliation' }
  ];

  const expItems = [
    { logo: '/images/sgrh.png',  org: 'Sir Ganga Ram Kolmet Hospital', role: 'Clinical Dietitian', tag: 'Experience' },
    { logo: '/images/park-hospital.png', org: 'Park Group of Hospitals', role: 'Senior Nutritionist', tag: 'Experience' },
    { logo: '/images/medanta.png', org: 'Medanta – The Medicity, Gurugram', role: 'Intern Dietitian', tag: 'Experience' }
  ];

  const eduItems = [
    { logo: '/images/amity.png', org: 'Amity University', role: 'MSc – Dietetics & Nutrition', tag: 'Education' }
  ];

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
      <SEO title="About – Dietitian Jyoti" description="Clinical dietitian with 7+ years of experience. Personalized, practical, and evidence-based nutrition care." canonical="/about" image="/images/banner-about.svg" />

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
              <Typography variant="overline" color="text.secondary">Dietitian & Nutritionist</Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1.1 }}>Dt. Jyoti Jangid</Typography>
              <Typography variant="h6" color="text.secondary">
                I help you build sustainable nutrition habits with practical, culturally relevant plans—grounded in clinical nutrition.
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
              <Avatar
                src="/images/profile-jyoti.jpg"
                alt="Profile photo"
                sx={{
                  width: 160,
                  height: 160,
                  border: '4px solid #fff',
                  boxShadow: 2,
                  bgcolor: '#eee',
                  objectFit: 'cover'
                }}
              />
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
        {/* Row 1: Affiliations */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>Affiliations</Typography>
          <Stack spacing={2}>
            {affItems.map((it, idx) => (
              <React.Fragment key={it.org}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', p: 1 }}>
                  <Box component="img" src={it.logo} alt={it.org}
                       sx={{ width: 64, height: 64, objectFit: 'contain', filter: 'grayscale(1) contrast(1.05)', mb: 0.5 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{it.org}</Typography>
                  <Typography variant="body2" color="text.secondary">{it.role}</Typography>
                  {/* removed tag chip */}
                </Box>
                {idx < affItems.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </Stack>
        </Grid>

        {/* Row 2: Experience */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>Experience</Typography>
          <Box sx={{ display: 'flex', gap: { xs: 2, md: 4 }, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start' }}>
            {expItems.map((it) => (
              <Box key={it.org} sx={{ minWidth: 200, maxWidth: 260, textAlign: 'center', p: 1 }}>
                <Box component="img" src={it.logo} alt={it.org}
                     sx={{ width: 64, height: 64, objectFit: 'contain', filter: 'grayscale(1) contrast(1.05)', mb: 0.5 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{it.org}</Typography>
                <Typography variant="body2" color="text.secondary">{it.role}</Typography>
                {/* removed tag chip */}
              </Box>
            ))}
          </Box>
        </Grid>

        {/* Row 3: Education */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>Education</Typography>
          <Stack spacing={2}>
            {eduItems.map((it, idx) => (
              <React.Fragment key={it.org}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', p: 1 }}>
                  <Box component="img" src={it.logo} alt={it.org}
                       sx={{ width: 64, height: 64, objectFit: 'contain', filter: 'grayscale(1) contrast(1.05)', mb: 0.5 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{it.org}</Typography>
                  <Typography variant="body2" color="text.secondary">{it.role}</Typography>
                  {/* removed tag chip */}
                </Box>
                {idx < eduItems.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </Stack>
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />
      <Box sx={{ textAlign: 'center', mb: 1 }}>
        <Typography variant="subtitle2" color="text.secondary">Affiliations & Experience</Typography>
      </Box>
      {/* show all logos in a single row */}
      <Box
        sx={{
          display: 'flex',
          gap: { xs: 2, md: 4 },
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          py: 1
        }}
      >
        {logos.map((l) => (
          <Box
            key={l.src}
            component="img"
            src={l.src}
            alt={l.alt}
            sx={{
              height: 48,
              maxWidth: 160,
              objectFit: 'contain',
              filter: 'grayscale(1) contrast(1.1)',
              opacity: 0.95
            }}
          />
        ))}
      </Box>
    </Paper>
  </Section>
</>
)}
