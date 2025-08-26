import React from 'react';
import { Box, Container, Typography, Stack, Link } from '@mui/material';

export default function Footer() {
  return (
    <Box component="footer" sx={{ mt: 8, py: 5, backgroundColor: 'background.paper', borderTop: '1px solid', borderColor: 'grey.200' }}>
      <Container maxWidth="md">
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
          <Typography color="text.secondary">© {new Date().getFullYear()} GoNutriMind. All rights reserved.</Typography>
          <Stack direction="row" spacing={2}>
            <Link href="/about" color="inherit" underline="hover">About</Link>
            <Link href="/blogs" color="inherit" underline="hover">Blogs</Link>
            <Link href="/contact" color="inherit" underline="hover">Contact</Link>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
