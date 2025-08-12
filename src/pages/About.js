import React from 'react';
import { Typography, Paper, Grid, Box, Chip, Divider, List, ListItem, ListItemText, Card, CardContent, Stack } from '@mui/material';
import Button from '@mui/material/Button';
import Banner from '../components/Banner';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function About() {
  useDocumentTitle('About');
  return (
    <>
      <Banner src="/images/banner-about.svg" alt="About banner" />
  <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 3 }}>
        <Grid container spacing={4}>
          {/* Left profile card */}
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Stack alignItems="center" spacing={2}>
                  <Box component="img" src="/images/humans/avatar.svg" alt="Dt. Jyoti" sx={{ width: 140, height: 140, borderRadius: '50%' }} />
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>Dt. Jyoti Jangid</Typography>
                    <Typography variant="body2" color="text.secondary">Dietitian & Nutritionist</Typography>
                  </Box>
                  <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
                    <Chip label="Evidence-based" size="small" />
                    <Chip label="Client‑centric" size="small" />
                    <Chip label="In‑clinic & Online" size="small" />
                  </Stack>
                  <Button fullWidth variant="contained" href="/appointment">Book Appointment</Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Right content */}
          <Grid item xs={12} md={8}>
            <Typography variant="h4" gutterBottom>About</Typography>
            <Typography paragraph>
              I help individuals and families build sustainable nutrition habits with practical, culturally relevant plans.
              My approach combines medical nutrition therapy with behavior coaching—so you not only receive a plan, you learn how to make it work in real life.
            </Typography>

            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>Areas of Focus</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {['Weight Management','Diabetes Care','PCOS/PCOD','Thyroid Health','Heart Health','Liver & Renal Support','Pregnancy & Lactation','Child & Teen Nutrition','Digestive Health','Gluten‑free & Intolerances','Sports Nutrition'].map(t => <Chip key={t} label={t} />)}
            </Box>

            <Typography variant="h6" gutterBottom>How I Work</Typography>
            <Typography component="ul" sx={{ pl: 2, mb: 2 }}>
              <li>Comprehensive assessment: history, routine, preferences, and labs (if applicable)</li>
              <li>Personalized meal planning: Indian and global options, easy to follow</li>
              <li>Habit coaching: portion guidance, smart swaps, and mindful routines</li>
              <li>Progress reviews: iterative adjustments to keep results on track</li>
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Specializations</Typography>
                <List dense>
                  <ListItem disableGutters>
                    <ListItemText primary="Dietitian/Nutritionist" />
                  </ListItem>
                </List>

                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Awards and Recognitions</Typography>
                <List dense>
                  <ListItem disableGutters>
                    <ListItemText primary="Best Dietitian - 2017" />
                  </ListItem>
                </List>

                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Education</Typography>
                <List dense>
                  <ListItem disableGutters>
                    <ListItemText primary="MSc - Dietitics / Nutrition" secondary="Amity University, Gurgaon, 2014" />
                  </ListItem>
                </List>

                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Memberships</Typography>
                <List dense>
                  <ListItem disableGutters>
                    <ListItemText primary="Indian Dietetic Association" />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Experience</Typography>
                <List dense>
                  <ListItem disableGutters>
                    <ListItemText primary="2014 - 2015" secondary="Clinical Dietitian at Sir Ganga Ram Kolmet Hospital" />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemText primary="2015 - 2018" secondary="Senior Nutritionist at Park Group of Hospitals" />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemText primary="2018 - 2018" secondary="Senior Nutritionist at Jyoti Hospital" />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    </>
  );
}
