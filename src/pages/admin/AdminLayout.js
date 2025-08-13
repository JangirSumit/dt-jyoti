import React, { useState } from 'react';
import { Box, Drawer, List, ListItemButton, ListItemText, Toolbar, AppBar, Typography, Container, Button, IconButton, Tooltip } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import { Link as RouterLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

const drawerWidth = 220;

export default function AdminLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
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
  const toggleMobile = () => setMobileOpen((v) => !v);
  const closeMobile = () => setMobileOpen(false);
  const NavList = (
    <List>
      {items.map((it) => (
        <ListItemButton key={it.to} component={RouterLink} to={it.to} selected={pathname === it.to} onClick={closeMobile}>
          <ListItemText primary={it.label} />
        </ListItemButton>
      ))}
    </List>
  );
  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: 1201 }}>
        <Toolbar disableGutters>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', px: { xs: 1, md: 2 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                color="inherit"
                edge="start"
                onClick={toggleMobile}
                sx={{ mr: 1, display: { xs: 'inline-flex', md: 'none' } }}
                aria-label="open navigation"
              >
                <MenuIcon />
              </IconButton>
              <Box
                component={RouterLink}
                to="/"
                sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit', mr: 1 }}
              >
                <Box component="img" src="/logo64.png" alt="logo" sx={{ width: 32, height: 32, mr: 1, borderRadius: '8px' }} />
              </Box>
              <Typography variant="h6" noWrap component="div">Admin</Typography>
            </Box>
            <Box>
            <Button
              color="inherit"
              onClick={logout}
              startIcon={<LogoutIcon />}
              sx={{ ml: 1, display: { xs: 'none', md: 'inline-flex' } }}
            >
              Logout
            </Button>
            <Tooltip title="Logout">
              <IconButton
                color="inherit"
                onClick={logout}
                aria-label="logout"
                sx={{ display: { xs: 'inline-flex', md: 'none' } }}
              >
                <LogoutIcon />
              </IconButton>
            </Tooltip>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
      {/* Mobile temporary drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={toggleMobile}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' } }}
      >
        <Toolbar />
        {NavList}
      </Drawer>
      {/* Desktop permanent drawer */}
      <Drawer
        variant="permanent"
        open
        sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' } }}
      >
        <Toolbar />
        {NavList}
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, width: { md: `calc(100% - ${drawerWidth}px)` }, ml: { md: `${drawerWidth}px` } }}>
        <Toolbar />
        <Container maxWidth="lg">
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}
