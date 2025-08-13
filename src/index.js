import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { ThemeProvider, createTheme, responsiveFontSizes } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { HelmetProvider } from 'react-helmet-async';

const container = document.getElementById('root');
const root = createRoot(container);
let theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#2e7d32' },
    secondary: { main: '#00838f' },
    background: { default: '#e0e7ef', paper: '#ffffff' },
    text: { primary: '#111827', secondary: '#6b7280' }
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: 'Inter, Roboto, Helvetica, Arial, sans-serif',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 800 },
    h3: { fontWeight: 800 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600 }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: (themeArg) => ({
        body: {
          backgroundColor: themeArg.palette.background.default,
          color: themeArg.palette.text.primary,
        },
      }),
    },
    MuiAppBar: {
      styleOverrides: { root: { boxShadow: 'none', borderBottom: '1px solid rgba(0,0,0,0.08)' } }
    },
    MuiButton: {
      defaultProps: { size: 'medium' },
      styleOverrides: {
        root: { borderRadius: 10 },
        containedPrimary: { boxShadow: 'none' }
      }
    },
  MuiPaper: { styleOverrides: { root: { boxShadow: '0 1px 2px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)' } } },
    MuiCard: { defaultProps: { elevation: 1 } },
    MuiContainer: { defaultProps: { maxWidth: 'lg' } }
  }
});
theme = responsiveFontSizes(theme);
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </HelmetProvider>
  </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
