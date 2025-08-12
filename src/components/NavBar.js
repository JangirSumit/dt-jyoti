import React from 'react';
import { AppBar, Toolbar, Typography, Button, Stack, Box, IconButton, Drawer, List, ListItemButton, ListItemText, Divider } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link as RouterLink } from 'react-router-dom';

export default function NavBar() {
  const [open, setOpen] = React.useState(false);
  const toggle = (val) => () => setOpen(val);
  const links = [
    { label: 'Home', to: '/' },
    { label: 'About Me', to: '/about' },
    { label: 'Appointment', to: '/appointment' },
    { label: 'BMI/BMR', to: '/calculator' },
    { label: 'AI Plans', to: '/ai-plans' },
    { label: 'Blogs', to: '/blogs' },
    { label: 'Contact', to: '/contact', outlined: true },
  ];
  return (
    <AppBar position="sticky" color="inherit">
      <Toolbar sx={{ gap: 2 }}>
        <Box component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
          <Box component="img" src="/logo64.png" alt="logo" sx={{ width: 36, height: 36, mr: 1, borderRadius: '8px' }} />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Dietitian Jyoti</Typography>
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        {/* Desktop menu */}
        <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' } }}>
          {links.map((l) => (
            <Button key={l.to} component={RouterLink} to={l.to} variant={l.outlined ? 'outlined' : 'text'}>{l.label}</Button>
          ))}
        </Stack>
        {/* Mobile menu button */}
        <IconButton onClick={toggle(true)} sx={{ display: { xs: 'inline-flex', md: 'none' } }}>
          <MenuIcon />
        </IconButton>
        <Drawer anchor="right" open={open} onClose={toggle(false)}>
          <Box sx={{ width: 260 }} role="presentation" onClick={toggle(false)} onKeyDown={toggle(false)}>
            <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
              <Box component="img" src="/logo64.png" alt="logo" sx={{ width: 28, height: 28, mr: 1, borderRadius: '6px' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Dietitian Jyoti</Typography>
            </Box>
            <Divider />
            <List>
              {links.map((l) => (
                <ListItemButton key={l.to} component={RouterLink} to={l.to}>
                  <ListItemText primary={l.label} />
                </ListItemButton>
              ))}
            </List>
          </Box>
        </Drawer>
      </Toolbar>
    </AppBar>
  );
}
