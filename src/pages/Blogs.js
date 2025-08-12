import React from 'react';
import { Paper, Typography, List, ListItem, ListItemText } from '@mui/material';
import Banner from '../components/Banner';

const demo = [
  { id: 1, title: '5 Breakfast Ideas for PCOD', excerpt: 'High-fiber, low-GI meals to stabilize insulin...' },
  { id: 2, title: 'Understanding Thyroid and Diet', excerpt: 'Iodine, selenium, and balanced macronutrients...' },
  { id: 3, title: 'Hydration and Weight Management', excerpt: 'How water intake supports metabolism and satiety...' },
];

export default function Blogs() {
  return (
    <>
      <Banner src="/images/banner-blogs.svg" alt="Blogs banner" />
      <Paper sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Blogs</Typography>
      <List>
        {demo.map((b) => (
          <ListItem key={b.id} divider>
            <ListItemText primary={b.title} secondary={b.excerpt} />
          </ListItem>
        ))}
      </List>
      </Paper>
    </>
  );
}
