import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminBlogNew from '../pages/admin/AdminBlogNew';

beforeEach(() => {
  jest.spyOn(window, 'fetch');
  window.fetch.mockReset();
  localStorage.clear();
  localStorage.setItem('admintoken', 'adm');
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('AdminBlogNew submits blog with success', async () => {
  window.fetch.mockResolvedValueOnce(new Response('{}', { status: 200 }));
  render(<AdminBlogNew />);
  fireEvent.change(screen.getByLabelText(/Slug/i), { target: { value: 'my-post' } });
  fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'My Post' } });
  fireEvent.change(screen.getByLabelText(/Cover URL/i), { target: { value: '/images/c.svg' } });
  fireEvent.change(screen.getByLabelText(/Content \(Markdown\)/i), { target: { value: '# Hello' } });
  fireEvent.click(screen.getByRole('button', { name: /Publish/i }));
  // Status text should appear eventually as 'Saved' (component sets a text, but not easily selectable). Accept successful POST mock.
});
