import React from 'react';
import { AppBar, Toolbar, Typography, Button, Stack } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export default function NavBar() {
  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>Dietitian Jyoti</Typography>
        <Stack direction="row" spacing={1}>
          <Button color="inherit" component={RouterLink} to="/">Home</Button>
          <Button color="inherit" component={RouterLink} to="/about">About Me</Button>
          <Button color="inherit" component={RouterLink} to="/appointment">Appointment</Button>
          <Button color="inherit" component={RouterLink} to="/calculator">BMI/BMR</Button>
          <Button color="inherit" component={RouterLink} to="/blogs">Blogs</Button>
          <Button color="inherit" component={RouterLink} to="/contact">Contact</Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
