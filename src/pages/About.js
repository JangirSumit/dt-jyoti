import React from 'react';
import { Typography, Box, Paper } from '@mui/material';

export default function About() {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>About Me</Typography>
      <Typography>
        Hi, I’m Jyoti, a certified dietitian with a passion for evidence-based nutrition. I work with clients to build
        sustainable habits that support their health goals, including weight management, diabetes control, thyroid balance,
        and specialized life stages like pregnancy and lactation.
      </Typography>
    </Paper>
  );
}
