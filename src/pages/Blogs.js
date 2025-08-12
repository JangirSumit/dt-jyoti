import React, { useEffect, useState } from 'react';
import { Paper, Typography, Grid, Card, CardContent, CardActions, Button, CardMedia } from '@mui/material';
import Banner from '../components/Banner';
import { Link as RouterLink } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function Blogs() {
  useDocumentTitle('Blogs');
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // Static manifest of markdown posts from public/blog
    setPosts([
  { slug: 'diabetes-basics', title: 'Diabetes Diet Essentials – Practical Tips and Sample Day', excerpt: 'Manage blood sugar with balanced carbs, fiber-rich foods, and steady meal timing. Includes a sample one-day plan.', cover: '/images/blog/diabetes.svg' },
  { slug: 'child-diet-guide', title: 'Child Nutrition – Growth, Immunity, and Habits', excerpt: 'Build strong foundations with balanced plates, smart snacks, hydration, and routine.', cover: '/images/blog/child.svg' },
  { slug: 'pollution-control-diets', title: 'Diets for Pollution Exposure – Protect with Antioxidants', excerpt: 'Air pollution increases oxidative stress; nutrition can help counteract it.', cover: '/images/blog/pollution.svg' },
    ]);
  }, []);

  return (
    <>
      <Banner src="/images/banner-blogs.svg" alt="Blogs banner" />
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h4" gutterBottom>Blogs</Typography>
        <Grid container spacing={2}>
          {posts.map(p => (
            <Grid item xs={12} md={4} key={p.slug}>
              <Card sx={{ borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia component="img" height="120" image={p.cover} alt={p.title} sx={{ objectFit: 'cover' }} />
                <CardContent>
                  <Typography variant="h6">{p.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{p.excerpt}</Typography>
                </CardContent>
                <CardActions sx={{ mt: 'auto' }}>
                  <Button component={RouterLink} to={`/blogs/${p.slug}`}>Read more</Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </>
  );
}
