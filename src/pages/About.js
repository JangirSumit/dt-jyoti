import React, { useEffect, useRef, useState } from 'react';
import { Typography, Paper, Grid, Box, Chip, Divider, Card, CardContent, Stack, Avatar, Tooltip, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
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
  // --- Team grid component (local) ---
  function TeamGridSection() {
    const [members] = useState([
      {
        id: 'jyoti',
        name: 'Dietitian Jyoti Jangid',
        title: 'Clinical Nutritionist',
        bio: 'MSc – Dietetics & Nutrition. Clinical experience in hospitals and private practice, specialising in metabolic health, weight management, and women’s health.',
        experience: [
          'Clinical Dietitian — Sir Ganga Ram Kolmet Hospital',
          'Senior Nutritionist — Park Group of Hospitals',
          'Private practice — weight management, metabolic health, women’s health',
        ],
        avatar: '/images/humans/dietitian.svg',
        stats: { yrs: '7+ yrs', clients: '1000+', rating: '4.9/5' },
      },
      { id: 't3', name: 'Physician (MD)', title: 'Physician', bio: 'Joining soon', avatar: '/images/humans/physician.svg', stats: {}, contact: { email: '', phone: '' }, available: false },
      { id: 't4', name: 'Yoga Teacher', title: 'Yoga Instructor', bio: 'Joining soon', avatar: '/images/humans/yoga-teacher.svg', stats: {}, contact: { email: '', phone: '' }, available: false },
    ]);

  const [index, setIndex] = useState(0);
  const maxIndex = members.length - 1;
  const selected = members[index];
  const sliderRef = useRef(null);
  const [slidePx, setSlidePx] = useState(680);
  const [transformPx, setTransformPx] = useState(0);
  const gap = 16; // px gap between slides
  const [paused, setPaused] = useState(false);

  // compute slide size and transform so the active slide is centered and adjacent slides peek
    useEffect(() => {
    function recompute() {
      const container = sliderRef.current;
      if (!container) return;
      const w = container.clientWidth;
      const pct = window.innerWidth < 600 ? 0.92 : 0.78; // percent width of each slide
      const slide = Math.round(w * pct);
      setSlidePx(slide);
      const offset = Math.round((w - slide) / 2);
      const tx = Math.round(index * (slide + gap) - offset);
      setTransformPx(tx);
    }
    recompute();
    window.addEventListener('resize', recompute);
    return () => window.removeEventListener('resize', recompute);
  }, [index, gap, members.length]);

  // autoplay (respects paused state)
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIndex((i) => (i >= maxIndex ? 0 : i + 1)), 5000);
    return () => clearInterval(t);
  }, [maxIndex, paused]);

    const goPrev = () => setIndex((i) => (i <= 0 ? maxIndex : i - 1));
    const goNext = () => setIndex((i) => (i >= maxIndex ? 0 : i + 1));

    return (
      <>
        <Box sx={{ width: '100%' }}>
          {/* navigation removed (dots are the primary control) */}

          <Box
            ref={sliderRef}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            sx={{ overflow: 'hidden', px: { xs: 0, md: 2 } }}
          >
            <Box
              sx={{
                display: 'flex',
                gap: `${gap}px`,
                transition: 'transform 620ms cubic-bezier(.16,.84,.24,1)',
                transform: `translateX(-${transformPx}px)`,
                pb: 1,
              }}
            >
              {members.map((m) => (
                <Box key={m.id} sx={{ flex: `0 0 ${slidePx}px`, display: 'flex', justifyContent: 'center' }} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
                  <Card
                    elevation={m.id === selected.id ? 8 : 1}
                    sx={{
                      width: '100%',
                      borderRadius: 3,
                      cursor: m.bio === 'Joining soon' ? 'default' : 'pointer',
                      transition: 'transform 420ms cubic-bezier(.2,.8,.2,1), box-shadow 420ms ease, opacity 320ms ease',
                      transform: m.id === selected.id ? 'translateY(-10px) scale(1.02)' : 'scale(0.985)',
                      opacity: m.id === selected.id ? 1 : 0.82,
                      ...(m.bio === 'Joining soon' ? {} : { ':hover': { transform: 'translateY(-12px) scale(1.025)' } })
                    }}
                    onClick={() => m.bio !== 'Joining soon' && setIndex(members.findIndex(x => x.id === m.id))}
                  >
                    <CardContent sx={{ transition: 'opacity 360ms ease, transform 360ms ease' }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item>
                          <Avatar src={m.avatar || undefined} sx={{ width: 96, height: 96 }}>{!m.avatar && m.name.split(' ').map(n => n[0]).slice(0,2).join('')}</Avatar>
                        </Grid>
                        <Grid item xs>
                          <Typography variant="h6" sx={{ fontWeight: 800 }}>{m.name}</Typography>
                          <Typography color="text.secondary">{m.title}</Typography>
                          <Typography sx={{ mt: 1 }}>{m.bio}</Typography>
                          {m.experience && (
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="subtitle2">Experience</Typography>
                              <Box component="ul" sx={{ ml: 2 }}>
                                {m.experience.map((e, idx) => <li key={idx}><Typography>{e}</Typography></li>)}
                              </Box>
                            </Box>
                          )}
                          {m.stats && (
                            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                              {m.stats.yrs && <Chip label={m.stats.yrs} />}
                              {m.stats.clients && <Chip label={m.stats.clients} />}
                              {m.stats.rating && <Chip label={m.stats.rating} />}
                            </Stack>
                          )}
                        </Grid>
                        <Grid item>
                          <Stack spacing={1}>
                            {m.bio !== 'Joining soon' && (
                              <>
                                <Button variant="contained" href="/appointment">Book</Button>
                                <Button variant="outlined" href="/contact">Contact</Button>
                              </>
                            )}
                          </Stack>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          </Box>

          {/* bottom dots */}
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 2 }}>
            {members.map((m, i) => (
              <Box
                key={m.id}
                onClick={() => setIndex(i)}
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: i === index ? 'primary.main' : 'grey.400',
                  cursor: 'pointer',
                  transition: 'transform 220ms ease, background-color 220ms ease',
                  transform: i === index ? 'scale(1.35)' : 'scale(1)'
                }}
              />
            ))}
          </Box>

        </Box>

        <style>{`
          @keyframes fadeIn { to { opacity: 1; transform: none; } }
          .reveal-in { opacity: 1; transform: none; }
          .reveal { opacity: 0; transform: translateY(8px); transition: opacity 600ms ease, transform 600ms ease; }
        `}</style>
      </>
    );
  }
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
  {/* Team grid + selection */}
  <TeamGridSection />
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


  {/* Credentials compact removed per request */}
    </>
  );
}
