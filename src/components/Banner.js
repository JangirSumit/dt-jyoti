import React from 'react';
import { Box } from '@mui/material';

export default function Banner({ src, alt = 'banner' }) {
  return (
    <Box sx={{ mb: 3, borderRadius: 3, overflow: 'hidden', boxShadow: 1 }}>
      <Box component="img" src={src} alt={alt} sx={{ width: '100%', height: { xs: 140, md: 200 }, objectFit: 'cover' }} />
    </Box>
  );
}
