import React from 'react';
import { AppBar, Toolbar, Typography, Button, Stack, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export default function NavBar() {
  return (
    <AppBar position="sticky" color="primary" elevation={2}>
      <Toolbar sx={{ gap: 2 }}>
        <Box component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
          <Box component="img" src="/logo64.png" alt="logo" sx={{ width: 36, height: 36, mr: 1, borderRadius: '8px' }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Dietitian Jyoti</Typography>
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <Stack direction="row" spacing={1}>
          <Button color="inherit" component={RouterLink} to="/">Home</Button>
          <Button color="inherit" component={RouterLink} to="/about">About Me</Button>
          <Button color="inherit" component={RouterLink} to="/appointment">Appointment</Button>
          <Button color="inherit" component={RouterLink} to="/calculator">BMI/BMR</Button>
          <Button color="inherit" component={RouterLink} to="/ai-plans">AI Plans</Button>
          <Button color="inherit" component={RouterLink} to="/blogs">Blogs</Button>
          <Button color="inherit" component={RouterLink} to="/contact">Contact</Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
