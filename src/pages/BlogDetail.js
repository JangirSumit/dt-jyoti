import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { Paper, Typography, Button, Stack, Chip, Box, Divider, IconButton } from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Banner from '../components/Banner';
import useDocumentTitle from '../hooks/useDocumentTitle';
import SEO from '../components/SEO';
import Section from '../components/Section';

export default function BlogDetail() {
  const { slug } = useParams();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [cover, setCover] = useState('');
  const [readMin, setReadMin] = useState(3);
  const tag = useMemo(() => {
    if (!slug) return 'Wellness';
    if (slug.includes('diabetes')) return 'Clinical';
    if (slug.includes('child')) return 'Lifestyle';
    return 'Wellness';
  }, [slug]);

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
  // estimate reading time (~200 wpm)
  const words = body.replace(/[#>*_`-]/g, ' ').split(/\s+/).filter(Boolean).length;
  setReadMin(Math.max(2, Math.round(words / 200)));
      } catch (e) {
        setContent('# Not Found\nThe requested article could not be loaded.');
      }
    }
    load();
  }, [slug]);

  useDocumentTitle(title || 'Blog');

  return (
    <>
      <SEO
        title={(title || 'Blog') + ' – Dietitian Jyoti'}
        description={content ? content.replace(/[#>*_`-]/g, ' ').split(/\s+/).slice(0, 24).join(' ') + '…' : 'Article'}
        canonical={`/blogs/${slug}`}
        image={cover || '/images/banner-blogs.svg'}
        type="article"
        article={{ title, publishedTime: new Date().toISOString(), author: 'Dietitian Jyoti' }}
      />
  {cover && <Banner src={cover} alt={title} />}
  <Section>
  <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <Button component={RouterLink} to="/blogs" size="small">&larr; Back</Button>
          <Box sx={{ flexGrow: 1 }} />
          <Chip size="small" label={tag} />
          <Chip size="small" label={`${readMin} min read`} />
          <IconButton size="small" onClick={() => { if (navigator.share) { navigator.share({ title, url: window.location.href }); } else { navigator.clipboard.writeText(window.location.href); } }}>
            <ShareIcon fontSize="small" />
          </IconButton>
        </Stack>
        <Typography variant="h4" sx={{ fontWeight: 800 }} gutterBottom>{title || 'Blog'}</Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{
          '& h1, & h2, & h3, & h4': { scrollMarginTop: 96, fontWeight: 700 },
          '& p': { mb: 2, color: 'text.primary' },
          '& ul, & ol': { pl: 3, mb: 2 },
          '& img': { maxWidth: '100%', borderRadius: 2, boxShadow: 1 },
          '& blockquote': { borderLeft: '4px solid #e0e0e0', pl: 2, color: 'text.secondary' },
          '& code': { bgcolor: 'rgba(0,0,0,0.04)', px: .5, py: .2, borderRadius: .5 }
        }}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({node, ...props}) => <Typography variant="h4" gutterBottom {...props} />,
              h2: ({node, ...props}) => <Typography variant="h5" gutterBottom {...props} />,
              h3: ({node, ...props}) => <Typography variant="h6" gutterBottom {...props} />,
              p: ({node, ...props}) => <Typography variant="body1" paragraph {...props} />,
              ul: ({node, ...props}) => <Box component="ul" {...props} />,
              ol: ({node, ...props}) => <Box component="ol" {...props} />,
              img: ({node, ...props}) => <Box component="img" {...props} />,
            }}
          >{content}</ReactMarkdown>
        </Box>
  </Paper>
  </Section>
    </>
  );
}
