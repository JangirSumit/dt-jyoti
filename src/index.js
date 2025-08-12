import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const container = document.getElementById('root');
const root = createRoot(container);
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#2e7d32' }, // green
    secondary: { main: '#00838f' }, // teal
    background: { default: '#fafafa' }
  },
  typography: {
    fontFamily: 'Inter, Roboto, Helvetica, Arial, sans-serif'
  }
});
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
