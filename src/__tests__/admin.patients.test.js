import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminPatients from '../pages/admin/AdminPatients';

beforeEach(() => {
  jest.spyOn(window, 'fetch');
  window.fetch.mockReset();
  localStorage.clear();
  localStorage.setItem('admintoken', 'adm');
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('AdminPatients shows empty state', async () => {
  window.fetch.mockResolvedValueOnce(new Response(JSON.stringify([]), { status: 200 }));
  render(<AdminPatients />);
  await screen.findByText(/No patients\./i);
});

test('AdminPatients can add a new patient and refresh list', async () => {
  // 1) initial GET -> []
  // 2) POST -> ok
  // 3) GET -> [new]
  const newPatient = { id: 'p1', name: 'Ria', contact: '999', email: 'r@e.com', notes: 'vip' };
  window.fetch
    .mockResolvedValueOnce(new Response(JSON.stringify([]), { status: 200 }))
    .mockResolvedValueOnce(new Response('{}', { status: 200 }))
    .mockResolvedValueOnce(new Response(JSON.stringify([newPatient]), { status: 200 }));

  render(<AdminPatients />);

  // Fill form and submit
  fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Ria' } });
  fireEvent.change(screen.getByLabelText(/Contact/i), { target: { value: '999' } });
  fireEvent.change(screen.getByLabelText(/^Email$/i), { target: { value: 'r@e.com' } });
  fireEvent.change(screen.getByLabelText(/Notes/i), { target: { value: 'vip' } });
  fireEvent.click(screen.getByRole('button', { name: /Add Patient/i }));

  // After reload, new patient appears
  await screen.findByText(/Ria/i);
});
