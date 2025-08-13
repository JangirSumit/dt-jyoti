import React, { useState } from 'react';
import { Paper, Typography, Grid, TextField, Button } from '@mui/material';

export default function AdminBlogNew() {
  const [form, setForm] = useState({ slug: '', title: '', cover: '', content: '' });
  const [status, setStatus] = useState('');
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    setStatus('');
    const token = localStorage.getItem('admintoken');
    const res = await fetch('/api/admin/blog', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(form) });
    if (res.ok) setStatus('Saved'); else setStatus('Failed');
  };
  return (
    <div>
      <Typography variant="h5" gutterBottom>Add Blog</Typography>
      <Paper sx={{ p: 2 }}>
        <form onSubmit={submit}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}><TextField label="Slug" name="slug" value={form.slug} onChange={onChange} fullWidth required helperText="lowercase-with-hyphens"/></Grid>
            <Grid item xs={12} md={8}><TextField label="Title" name="title" value={form.title} onChange={onChange} fullWidth required /></Grid>
            <Grid item xs={12}><TextField label="Cover URL" name="cover" value={form.cover} onChange={onChange} fullWidth placeholder="/images/abstract/a1.svg"/></Grid>
            <Grid item xs={12}><TextField label="Content (Markdown)" name="content" value={form.content} onChange={onChange} fullWidth multiline rows={12} required /></Grid>
            <Grid item xs={12}><Button type="submit" variant="contained">Publish</Button> {status}</Grid>
          </Grid>
        </form>
      </Paper>
    </div>
  );
}
