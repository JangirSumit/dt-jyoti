import React from 'react';
import { Typography, Paper } from '@mui/material';
import Banner from '../components/Banner';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function About() {
  useDocumentTitle('About');
  return (
    <>
      <Banner src="/images/banner-about.svg" alt="About banner" />
      <Paper sx={{ p: 4, borderRadius: 3 }}>
      <Typography variant="h4" gutterBottom>About Me</Typography>
      <Typography>
        Hi, I’m Jyoti, a certified dietitian with a passion for evidence-based nutrition. I work with clients to build
        sustainable habits that support their health goals, including weight management, diabetes control, thyroid balance,
        and specialized life stages like pregnancy and lactation.
      </Typography>
      </Paper>
    </>
  );
}
