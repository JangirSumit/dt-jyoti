import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import Appointment from '../pages/Appointment';
import Contact from '../pages/Contact';
import Login from '../pages/admin/Login';
import AdminAppointments from '../pages/admin/AdminAppointments';

beforeEach(() => {
  jest.spyOn(window, 'fetch');
  window.fetch.mockReset();
  // prevent real navigations
  delete window.location;
  window.location = { href: '' };
  localStorage.clear();
});

afterEach(() => {
  jest.restoreAllMocks();
});

const renderWithProviders = (ui) =>
  render(ui, { wrapper: ({ children }) => <HelmetProvider>{children}</HelmetProvider> });

test('appointment booking opens OTP dialog and completes after verify', async () => {
  // mock slots lookup
  window.fetch.mockImplementation((url, opts) => {
    if (String(url).includes('/api/slots')) {
      return Promise.resolve(new Response(JSON.stringify({ slots: ['10:00 AM'] }), { status: 200 }));
    }
    if (String(url).endsWith('/api/otp/request')) {
      return Promise.resolve(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    }
    if (String(url).endsWith('/api/otp/verify')) {
      return Promise.resolve(new Response(JSON.stringify({ token: 'tok' }), { status: 200 }));
    }
    if (String(url).endsWith('/api/appointments')) {
      return Promise.resolve(new Response(JSON.stringify({ id: '1' }), { status: 201 }));
    }
    return Promise.resolve(new Response('{}', { status: 200 }));
  });

  renderWithProviders(<Appointment />);

  fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Riya' } });
  fireEvent.change(screen.getByLabelText(/Contact/i), { target: { value: '+911234567890' } });
  fireEvent.change(screen.getByLabelText(/Date/i), { target: { value: '2030-01-01' } });

  // open slot select and choose
  fireEvent.mouseDown(screen.getByText(/Select Slot/i));
  fireEvent.click(await screen.findByText('10:00 AM'));

  fireEvent.click(screen.getByRole('button', { name: /Book/i }));

  // Dialog should appear after sending OTP
  await screen.findByText(/Verify your mobile/i);
  const otpField = screen.getByLabelText(/OTP/i);
  fireEvent.change(otpField, { target: { value: '123456' } });
  fireEvent.click(screen.getByRole('button', { name: /Verify & Book/i }));

  await waitFor(() => expect(window.fetch).toHaveBeenCalledWith(
    '/api/appointments', expect.any(Object)
  ));

  // success snackbar shows
  await screen.findByText(/Appointment booked!/i);
});

test('contact form submits successfully', async () => {
  window.fetch.mockResolvedValueOnce(new Response('{}', { status: 200 }));
  renderWithProviders(<Contact />);
  fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'John' } });
  fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'john@example.com' } });
  fireEvent.change(screen.getByLabelText(/Message/i), { target: { value: 'Hello' } });
  fireEvent.click(screen.getByRole('button', { name: /Send/i }));
  await screen.findByText(/Your message has been sent/i);
});

test('admin login stores token and redirects', async () => {
  window.fetch.mockResolvedValueOnce(new Response(JSON.stringify({ token: 'adm' }), { status: 200 }));
  renderWithProviders(<Login />);
  fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'admin' } });
  fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'secret' } });
  fireEvent.click(screen.getByRole('button', { name: /Login/i }));
  await waitFor(() => expect(localStorage.getItem('admintoken')).toBe('adm'));
});

test('admin appointments list renders items and can delete', async () => {
  // initial list then delete
  const appts = [{ id: '1', name: 'A', contact: '1', date: '2030-01-01', slot: '10:00 AM' }];
  window.fetch
    .mockResolvedValueOnce(new Response(JSON.stringify(appts), { status: 200 }))
    .mockResolvedValueOnce(new Response(JSON.stringify(appts[0]), { status: 200 }));
  localStorage.setItem('admintoken', 'adm');
  renderWithProviders(<AdminAppointments />);
  await screen.findByText('A');
  fireEvent.click(screen.getByLabelText(/Delete appointment/i));
});
