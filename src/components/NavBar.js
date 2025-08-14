import React, { useEffect, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Stack,
  Box,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link as RouterLink } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const toggle = (val) => () => setOpen(val);

  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const toolbarH = isMdUp ? 64 : 56;
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { label: 'Home', to: '/' },
    { label: 'About me', to: '/about' },
    { label: 'Blogs', to: '/blogs' },
    { label: 'Contact', to: '/contact', outlined: true },
  ];

  return (
    <Box component="header" sx={{ position: 'relative', zIndex: (t) => t.zIndex.appBar + 1 }}>
      {/* Primary nav (existing options) */}
      <AppBar
        color="default"
        elevation={0}
        position="fixed"
        sx={{
          top: 0,
          transform: scrolled ? 'translateY(-100%)' : 'translateY(0)',
          transition: 'transform 280ms ease',
          borderBottom: '1px solid',
          borderColor: 'divider',
          zIndex: (t) => t.zIndex.appBar + 2,
        }}
      >
        <Toolbar sx={{ minHeight: `${toolbarH}px`, gap: 2 }}>
          <Box
            component={RouterLink}
            to="/"
            sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}
          >
            <Box component="img" src="/logo64.png" alt="logo" sx={{ width: 36, height: 36, mr: 1, borderRadius: '8px' }} />
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Dietitian Jyoti
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          {/* Desktop menu */}
          <Stack direction="row" spacing={1.5} sx={{ display: { xs: 'none', md: 'flex' } }}>
            {links.map((l) => (
              <Button key={l.to} component={RouterLink} to={l.to} variant={l.outlined ? 'outlined' : 'text'} size="medium">
                {l.label}
              </Button>
            ))}
          </Stack>
          {/* Mobile menu button */}
          <IconButton onClick={toggle(true)} sx={{ display: { xs: 'inline-flex', md: 'none' } }}>
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Secondary nav (CTA bar) */}
      <AppBar
        color="inherit"
        elevation={scrolled ? 1 : 0}
        position="fixed"
        sx={{
          top: scrolled ? 0 : toolbarH,
          transition:
            'top 280ms ease, background-color 220ms ease, border-color 220ms ease, box-shadow 220ms ease, backdrop-filter 220ms ease',
          borderBottom: '1px solid',
          borderColor: scrolled ? 'divider' : 'transparent',
          zIndex: (t) => t.zIndex.appBar + 3,
          backgroundImage: 'none',
          backdropFilter: scrolled ? 'blur(6px) saturate(1.1)' : 'none',
          backgroundColor: (t) =>
            scrolled ? (t.palette.mode === 'dark' ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.7)') : 'transparent',
        }}
      >
        <Toolbar sx={{ minHeight: `${toolbarH}px`, gap: 1, flexWrap: 'wrap' }}>
          {scrolled ? (
            <Typography variant="subtitle2" sx={{ fontWeight: 800, display: { xs: 'none', md: 'block' } }}>
              Why choose Dt. Jyoti
            </Typography>
          ) : (
            <Box />
          )}
          <Box sx={{ flex: 1 }} />
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Button size="medium" variant="contained" component={RouterLink} to="/ai-plans" aria-label="Get your AI plan">
              Get your AI plan
            </Button>
            <Button size="medium" variant="outlined" component={RouterLink} to="/calculator" aria-label="Calculate your BMI / BMR">
              Calculate your BMI / BMR
            </Button>
            <Button size="medium" variant="text" component={RouterLink} to="/appointment" aria-label="Book consultation">
              Book consultation
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
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
          <Divider />
          <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button fullWidth variant="contained" component={RouterLink} to="/ai-plans">Get your AI plan</Button>
            <Button fullWidth variant="outlined" component={RouterLink} to="/calculator">Open calculator</Button>
            <Button fullWidth variant="text" component={RouterLink} to="/appointment">Book consultation</Button>
          </Box>
        </Box>
      </Drawer>

      {/* Spacer to offset fixed app bars */}
      <Box sx={{ height: scrolled ? toolbarH : toolbarH * 2 }} />
    </Box>
  );
}
