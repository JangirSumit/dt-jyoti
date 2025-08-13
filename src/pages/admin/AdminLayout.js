import React from 'react';
import { Box, Drawer, List, ListItemButton, ListItemText, Toolbar, AppBar, Typography, Container, Button } from '@mui/material';
import { Link as RouterLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

const drawerWidth = 220;

export default function AdminLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const items = [
    { to: '/admin/appointments', label: 'Appointments' },
    { to: '/admin/patients', label: 'Patients' },
    { to: '/admin/blogs/new', label: 'Add Blog' },
    { to: '/admin/prescriptions', label: 'Prescriptions' },
  ];
  const logout = async () => {
    const token = localStorage.getItem('admintoken');
    try { await fetch('/api/auth/logout', { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : {} }); } catch (e) {}
    localStorage.removeItem('admintoken');
    navigate('/admin/login', { replace: true });
  };
  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: 1201 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>Admin</Typography>
          <Button color="inherit" onClick={logout}>Logout</Button>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" sx={{ width: drawerWidth, [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' } }}>
        <Toolbar />
        <List>
          {items.map((it) => (
            <ListItemButton key={it.to} component={RouterLink} to={it.to} selected={pathname === it.to}>
              <ListItemText primary={it.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Container maxWidth="lg">
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}
