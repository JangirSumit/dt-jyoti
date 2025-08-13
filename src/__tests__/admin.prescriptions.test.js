import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminPrescriptions from '../pages/admin/AdminPrescriptions';

beforeEach(() => {
  jest.spyOn(window, 'fetch');
  window.fetch.mockReset();
  localStorage.clear();
  localStorage.setItem('admintoken', 'adm');
  // silence jsdom alert not implemented
  // eslint-disable-next-line no-alert
  window.alert = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('AdminPrescriptions loads patients and saves prescription', async () => {
  const patients = [{ id: 'p1', name: 'Ria', contact: '999' }];
  // first GET patients
  window.fetch
    .mockResolvedValueOnce(new Response(JSON.stringify(patients), { status: 200 }))
    .mockResolvedValueOnce(new Response('{}', { status: 200 }));

  render(<AdminPrescriptions />);

  // Select patient (menu opens by clicking input)
  const select = await screen.findByLabelText(/Patient/i);
  fireEvent.mouseDown(select);
  const option = await screen.findByText(/Ria — 999/i);
  fireEvent.click(option);

  // Enter prescription content
  fireEvent.change(screen.getByLabelText(/Prescription/i), { target: { value: 'Drink water.' } });
  fireEvent.click(screen.getByRole('button', { name: /Save/i }));
});
