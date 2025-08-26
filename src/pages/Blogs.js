import React, { useEffect, useMemo, useState } from 'react';
import { Paper, Typography, Grid, Card, CardMedia, Box, Stack, Chip, TextField, InputAdornment, Skeleton, Button, CardContent } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Banner from '../components/Banner';
import { Link as RouterLink } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle';
import SEO from '../components/SEO';
import Section from '../components/Section';

export default function Blogs() {
  useDocumentTitle('Blogs');
  const [posts, setPosts] = useState([]);
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState('All');

  useEffect(() => {
    // Static manifest of markdown posts from public/blog
    setPosts([
      { slug: 'diabetes-basics', title: 'Diabetes Diet Essentials – Practical Tips and Sample Day', excerpt: 'Manage blood sugar with balanced carbs, fiber-rich foods, and steady meal timing. Includes a sample one-day plan.', cover: '/images/blog/diabetes.svg', tag: 'Clinical', read: '4 min' },
      { slug: 'child-diet-guide', title: 'Child Nutrition – Growth, Immunity, and Habits', excerpt: 'Build strong foundations with balanced plates, smart snacks, hydration, and routine.', cover: '/images/blog/child.svg', tag: 'Lifestyle', read: '3 min' },
      { slug: 'pollution-control-diets', title: 'Diets for Pollution Exposure – Protect with Antioxidants', excerpt: 'Air pollution increases oxidative stress; nutrition can help counteract it.', cover: '/images/blog/pollution.svg', tag: 'Wellness', read: '5 min' },
      { slug: 'ultra-processed-foods', title: 'Ultra-Processed Foods – What They Are and How to Cut Back', excerpt: 'Understand UPFs, spot them quickly, and learn simple swaps to reduce them in daily meals.', cover: '/images/abstract/a1.svg', tag: 'Wellness', read: '4 min' },
      { slug: 'intermittent-fasting-basics', title: 'Intermittent Fasting – Evidence, Options, and Safety', excerpt: 'What IF is, potential benefits, who should avoid it, and practical tips to start safely.', cover: '/images/abstract/a1.svg', tag: 'Lifestyle', read: '5 min' },
      { slug: 'gut-health-probiotics', title: 'Gut Health 101 – Probiotics, Prebiotics, and Daily Habits', excerpt: 'Balance your microbiome with food sources and habits that support digestive wellness.', cover: '/images/abstract/a1.svg', tag: 'Wellness', read: '4 min' },
      { slug: 'hypertension-dash-diet', title: 'Hypertension – A Practical Guide to DASH Eating', excerpt: 'The DASH pattern made practical: meal ideas, plate-building, and sodium savvy.', cover: '/images/abstract/a1.svg', tag: 'Clinical', read: '4 min' },
      { slug: 'summer-hydration-electrolytes', title: 'Summer Hydration – Water, Electrolytes, and Smart Cooling', excerpt: 'How much to drink, when electrolytes help, and cooling choices for hot days.', cover: '/images/abstract/a1.svg', tag: 'Lifestyle', read: '3 min' },
    ]);
  }, []);

  const tags = ['All', 'Clinical', 'Lifestyle', 'Wellness'];
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter(p => (tag === 'All' || p.tag === tag) && (!q || p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q)));
  }, [posts, query, tag]);

  return (
    <>
  <SEO title="Nutrition Blog – GoNutriMind" description="Practical guides on diabetes, gut health, hydration, hypertension, intermittent fasting, and more." canonical="/blogs" image="/images/banner-blogs.svg" />
      <Banner src="/images/banner-blogs.svg" alt="Blogs banner" />
  <Section>
  <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }} justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h4">Insights & Guides</Typography>
          <TextField
            value={query}
            onChange={(e)=> setQuery(e.target.value)}
            placeholder="Search articles"
            size="small"
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
            sx={{ width: { xs: '100%', md: 320 } }}
          />
        </Stack>
        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
          {tags.map(t => (
            <Chip key={t} label={t} variant={tag === t ? 'filled' : 'outlined'} color={tag === t ? 'primary' : 'default'} onClick={()=> setTag(t)} />
          ))}
        </Stack>
        <Grid container spacing={{ xs: 2, md: 3 }}>
          {posts.length === 0 && [0,1,2].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={`sk-${i}`}>
              <Box sx={{ position: 'relative', width: '100%', pt: '62.5%', borderRadius: 3, overflow: 'hidden' }}>
                <Skeleton variant="rectangular" sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
              </Box>
            </Grid>
          ))}
          {posts.length > 0 && filtered.map(p => (
            <Grid item xs={12} sm={12} md={6} key={p.slug}>
              <Card component={RouterLink} to={`/blogs/${p.slug}`} aria-label={`Read: ${p.title}`} sx={{ display: 'flex', textDecoration: 'none', color: 'inherit', borderRadius: 3, overflow: 'hidden', bgcolor: 'background.paper', boxShadow: 1, '&:hover': { boxShadow: 6, transform: 'translateY(-4px)', transition: 'all .2s ease' } }}>
                <Box sx={{ width: { xs: '40%', md: '38%' }, minWidth: { xs: 120, md: 220 }, position: 'relative' }}>
                  <CardMedia component="img" image={p.cover} alt={p.title} loading="lazy" onError={(e)=>{ e.currentTarget.src = '/images/abstract/a1.svg'; }} sx={{ width: '100%', height: '100%', objectFit: 'cover', aspectRatio: '4/3' }} />
                </Box>
                <CardContent sx={{ flex: '1 1 auto', py: 2, pr: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack spacing={0.5}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip size="small" label={p.tag} variant="outlined" />
                        <Typography variant="caption" color="text.secondary">{p.read}</Typography>
                      </Stack>
                      <Typography variant="h6" sx={{ fontWeight: 800, mt: .5 }}>{p.title}</Typography>
                    </Stack>
                    <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                      <Button size="small" variant="outlined">Read</Button>
                    </Box>
                  </Stack>

                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.excerpt}</Typography>

                  <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    <Button component={RouterLink} to={`/blogs/${p.slug}`} size="small">Read more</Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {filtered.length === 0 && (
            <Grid item xs={12}>
              <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>No results found.</Box>
            </Grid>
          )}
        </Grid>
  </Paper>
  </Section>
    </>
  );
}
