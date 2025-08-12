import React, { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { Paper, Typography, Button } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Banner from '../components/Banner';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function BlogDetail() {
  const { slug } = useParams();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [cover, setCover] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/blog/${slug}.md`);
        const text = await res.text();
        // simple frontmatter parse (not YAML parser, basic)
        const fm = text.match(/^---([\s\S]*?)---/);
        let body = text;
        if (fm) {
          const fmText = fm[1];
          const t = fmText.match(/\btitle:\s*(.*)/);
          const c = fmText.match(/\bcover:\s*(.*)/);
          if (t) setTitle(t[1].trim());
          if (c) setCover(c[1].trim());
          body = text.slice(fm[0].length).trimStart();
        }
        setContent(body);
      } catch (e) {
        setContent('# Not Found\nThe requested article could not be loaded.');
      }
    }
    load();
  }, [slug]);

  useDocumentTitle(title || 'Blog');

  return (
    <>
      {cover && <Banner src={cover} alt={title} />}
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Button component={RouterLink} to="/blogs" size="small" sx={{ mb: 2 }}>&larr; Back to Blogs</Button>
        <Typography variant="h4" gutterBottom>{title || 'Blog'}</Typography>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </Paper>
    </>
  );
}
