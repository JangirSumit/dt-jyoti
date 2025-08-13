import React, { useEffect, useRef } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Divider } from '@mui/material';
import Button from '@mui/material/Button';
import { Link as RouterLink } from 'react-router-dom';
import VerifiedIcon from '@mui/icons-material/Verified';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import FemaleIcon from '@mui/icons-material/Female';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MonitorWeightIcon from '@mui/icons-material/MonitorWeight';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import PregnantWomanIcon from '@mui/icons-material/PregnantWoman';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import HeroBanner from '../components/HeroBanner';
import Tilt3D from '../components/Tilt3D';
import useDocumentTitle from '../hooks/useDocumentTitle';
import SEO from '../components/SEO';
import Section from '../components/Section';

export default function Home() {
  useDocumentTitle('Home');
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
    const t = setTimeout(() => {
      els.forEach((el) => el.classList.add('reveal-in'));
    }, 1200);
    return () => {
      clearTimeout(t);
      io.disconnect();
    };
  }, []);
  return (
    <Box>
  <SEO title="Dietitian Jyoti – Personalized Nutrition & Online Appointments" description="Clinical-grade diet plans, AI-assisted daily planning, and easy online appointments. Dietitian-led, practical nutrition." canonical="/" image="/images/banner-home.svg" />
  <HeroBanner
    title="Dietitian-led nutrition for real life"
    subtitle="Personalized plans, a smart calculator, and easy online bookings—built around your goals and routine."
    ctaText="Get AI Plan"
    ctaTo="/ai-plans"
  imageSrc="/images/humans/client2.svg"
      />

  <Section>
  <Grid container spacing={{ xs: 2, md: 3 }}>
    <Grid item xs={12} md={4} className="reveal" ref={(el) => (revealRef.current[0] = el)} style={{ transitionDelay: '60ms' }}>
      <Tilt3D>
      <Card elevation={2} sx={{ borderRadius: 3, height: '100%', transition: 'transform .25s ease, box-shadow .25s ease', '&:hover': { transform: 'translateY(-6px)', boxShadow: 6 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 160 }}>
          <RestaurantIcon color="success" sx={{ fontSize: 64 }} />
        </Box>
        <CardContent>
          <Typography variant="h6">Clinical nutrition plans</Typography>
          <Typography variant="body2" color="text.secondary">Personalized MNT protocols for diabetes, thyroid, PCOD, weight, and life stages.</Typography>
        </CardContent>
      </Card>
      </Tilt3D>
    </Grid>
    <Grid item xs={12} md={4} className="reveal" ref={(el) => (revealRef.current[1] = el)} style={{ transitionDelay: '140ms' }}>
      <Tilt3D>
      <Card elevation={2} sx={{ borderRadius: 3, height: '100%', transition: 'transform .25s ease, box-shadow .25s ease', '&:hover': { transform: 'translateY(-6px)', boxShadow: 6 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 160 }}>
          <AccessTimeIcon color="primary" sx={{ fontSize: 64 }} />
        </Box>
        <CardContent>
          <Typography variant="h6">Seamless online scheduling</Typography>
          <Typography variant="body2" color="text.secondary">See real-time availability and book a consultation in seconds.</Typography>
        </CardContent>
      </Card>
      </Tilt3D>
    </Grid>
    <Grid item xs={12} md={4} className="reveal" ref={(el) => (revealRef.current[2] = el)} style={{ transitionDelay: '220ms' }}>
      <Tilt3D>
      <Card elevation={2} sx={{ borderRadius: 3, height: '100%', transition: 'transform .25s ease, box-shadow .25s ease', '&:hover': { transform: 'translateY(-6px)', boxShadow: 6 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 160 }}>
          <AutoAwesomeIcon color="secondary" sx={{ fontSize: 64 }} />
        </Box>
        <CardContent>
          <Typography variant="h6">AI-assisted daily planning</Typography>
          <Typography variant="body2" color="text.secondary">Instant plans with calories, macros, and meal ideas—dietitian designed.</Typography>
        </CardContent>
      </Card>
      </Tilt3D>
    </Grid>
  </Grid>
    </Section>

      {/* Clinical services */}
      <Section>
  <Paper className="reveal" ref={(el) => (revealRef.current[3] = el)} style={{ transitionDelay: '100ms' }} sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
          <Typography variant="h5" gutterBottom>Clinical services</Typography>
          <Grid container spacing={{ xs: 1.5, md: 2 }}>
            {[
              { icon: <BloodtypeIcon color="error" />, title: 'Diabetes care', text: 'Type 1/2, prediabetes, gestational—glycemic control with practical meals.' },
              { icon: <FemaleIcon color="secondary" />, title: 'Thyroid & PCOD', text: 'Hormone-friendly plans to support metabolism and symptoms.' },
              { icon: <LocalHospitalIcon color="primary" />, title: 'Cardiac, renal, liver', text: 'Heart-healthy, renal-appropriate, liver-supportive diets.' },
              { icon: <MonitorWeightIcon color="success" />, title: 'Weight management', text: 'Evidence-based fat loss and sustainable habits.' },
              { icon: <ChildCareIcon color="warning" />, title: 'Child nutrition', text: 'Growth-focused, immunity-supportive meal planning.' },
              { icon: <PregnantWomanIcon color="secondary" />, title: 'Pregnancy & lactation', text: 'Balanced nutrition for mom and baby.' },
            ].map((s, i) => (
              <Grid item xs={12} md={4} key={i}>
                <Tilt3D>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%', transition: 'transform .2s ease, box-shadow .2s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Box sx={{ mt: 0.5 }}>{s.icon}</Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{s.title}</Typography>
                      <Typography variant="body2" color="text.secondary">{s.text}</Typography>
                      <Button size="small" sx={{ mt: 1 }} component={RouterLink} to="/appointment" variant="contained">Book consultation</Button>
                    </Box>
                  </Box>
                </Paper>
                </Tilt3D>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Section>

      {/* Care pathway */}
      <Section>
  <Paper className="reveal" ref={(el) => (revealRef.current[4] = el)} style={{ transitionDelay: '140ms' }} sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
          <Typography variant="h5" gutterBottom>Your care pathway</Typography>
          <Grid container spacing={{ xs: 1.5, md: 2 }}>
            {[
              { icon: <AssessmentIcon color="primary" />, title: 'Assess', text: 'History, lifestyle, labs, preferences.' },
              { icon: <RestaurantIcon color="success" />, title: 'Plan', text: 'MNT-aligned plate, calories, macros, meal timing.' },
              { icon: <SupportAgentIcon color="secondary" />, title: 'Coach', text: 'Follow-ups, habit stacking, adherence tweaks.' },
              { icon: <QueryStatsIcon color="action" />, title: 'Review', text: 'Track outcomes, iterate to your goals.' },
            ].map((s, i) => (
              <Grid item xs={12} md={3} key={i}>
                <Tilt3D>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2, height: '100%', transition: 'transform .2s ease, box-shadow .2s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>{s.icon}</Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{s.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{s.text}</Typography>
                </Paper>
                </Tilt3D>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Section>

      {/* Why choose Dt. Jyoti */}
  <Section>
  <Paper className="reveal" ref={(el) => (revealRef.current[5] = el)} sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
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
    </Section>

      {/* Testimonials */}
  <Section>
  <Box className="reveal" ref={(el) => (revealRef.current[6] = el)}>
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
  </Section>
    </Box>
  );
}
