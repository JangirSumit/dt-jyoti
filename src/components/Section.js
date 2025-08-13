import React from 'react';
import { Box } from '@mui/material';

/**
 * Section wrapper to normalize vertical rhythm across pages.
 * Props:
 *  - top?: spacing multiplier (default: { xs: 4, md: 6 })
 *  - bottom?: spacing multiplier (default: { xs: 4, md: 6 })
 */
export default function Section({ children, top = { xs: 4, md: 6 }, bottom = { xs: 4, md: 6 }, reveal = false, delay = 0, ...rest }) {
  return (
    <Box className={reveal ? 'reveal' : undefined} style={reveal ? { transitionDelay: `${delay}ms` } : undefined} sx={{ mt: top, mb: bottom }} {...rest}>
      {children}
    </Box>
  );
}
