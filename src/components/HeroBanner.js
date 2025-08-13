import React from 'react';
import { Box, Stack, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export default function HeroBanner({ title, subtitle, ctaText, ctaTo, imageSrc }) {
  return (
    <Box sx={{
      position: 'relative',
      overflow: 'hidden',
      borderRadius: 3,
  p: { xs: 3, md: 6 },
  mb: { xs: 6, md: 8 },
      color: 'text.primary',
  background: 'linear-gradient(120deg,#e7f5ef,#e9f0fb)',
  boxShadow: '0 8px 28px rgba(0,0,0,0.06)'
    }}>
      {/* Decorative waves */}
      <Box aria-hidden sx={{
        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.5
      }}>
        <svg width="100%" height="100%" preserveAspectRatio="none">
          <defs>
            <linearGradient id="wave" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#80cbc4"/>
              <stop offset="100%" stopColor="#a5d6a7"/>
            </linearGradient>
          </defs>
          <path d="M0,80 C200,140 400,0 600,60 C800,120 1000,40 1200,100 L1200,0 L0,0 Z" fill="url(#wave)"/>
          <path d="M0,160 C200,220 400,80 600,140 C800,200 1000,120 1200,180 L1200,0 L0,0 Z" fill="rgba(129,199,132,0.4)"/>
        </svg>
      </Box>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="center">
        <Box sx={{ flex: 1, position: 'relative', zIndex: 1 }}>
          <Typography variant="h3" sx={{ fontWeight: 800 }} gutterBottom>{title}</Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>{subtitle}</Typography>
          {ctaText && (
            <Button variant="contained" size="large" component={RouterLink} to={ctaTo} sx={{ mt: 2 }}>{ctaText}</Button>
          )}
        </Box>
        {imageSrc && (
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
            <Box component="img" src={imageSrc} alt="banner" sx={{ width: { xs: 220, md: 300 }, borderRadius: 4, boxShadow: 2 }} />
          </Box>
        )}
      </Stack>
    </Box>
  );
}
