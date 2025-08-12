import React from 'react';
import { AppBar, Toolbar, Typography, Button, Stack, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export default function NavBar() {
  return (
    <AppBar position="sticky" color="inherit">
      <Toolbar sx={{ gap: 2 }}>
        <Box component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
          <Box component="img" src="/logo64.png" alt="logo" sx={{ width: 36, height: 36, mr: 1, borderRadius: '8px' }} />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Dietitian Jyoti</Typography>
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <Stack direction="row" spacing={1}>
          <Button component={RouterLink} to="/">Home</Button>
          <Button component={RouterLink} to="/about">About Me</Button>
          <Button component={RouterLink} to="/appointment">Appointment</Button>
          <Button component={RouterLink} to="/calculator">BMI/BMR</Button>
          <Button component={RouterLink} to="/ai-plans">AI Plans</Button>
          <Button component={RouterLink} to="/blogs">Blogs</Button>
          <Button variant="outlined" component={RouterLink} to="/contact">Contact</Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
