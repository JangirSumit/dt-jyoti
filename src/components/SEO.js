import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEO({
  title,
  description,
  canonical,
  image,
  type = 'website',
  article,
}) {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const url = canonical ? (canonical.startsWith('http') ? canonical : `${origin}${canonical}`) : undefined;
  const img = image || '/logo128.png';
  const siteName = 'GoNutriMind — Nutrition for Mind, Mood, and Memory.';

  const jsonLd = article
    ? {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: article.title || title,
        description: description,
        image: img ? (img.startsWith('http') ? img : `${origin}${img}`) : undefined,
        mainEntityOfPage: url,
        author: article.author ? { '@type': 'Person', name: article.author } : undefined,
        datePublished: article.publishedTime,
        dateModified: article.modifiedTime || article.publishedTime,
        publisher: { '@type': 'Organization', name: siteName, logo: { '@type': 'ImageObject', url: `${origin}/logo128.png` } },
      }
    : null;

  return (
    <Helmet>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      {url && <link rel="canonical" href={url} />}

      {/* Open Graph */}
      {type && <meta property="og:type" content={type} />}
      {title && <meta property="og:title" content={title} />}
      {description && <meta property="og:description" content={description} />}        
      {url && <meta property="og:url" content={url} />}
      <meta property="og:site_name" content={siteName} />
      {img && <meta property="og:image" content={img.startsWith('http') ? img : `${origin}${img}`} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      {title && <meta name="twitter:title" content={title} />}
      {description && <meta name="twitter:description" content={description} />}
      {img && <meta name="twitter:image" content={img.startsWith('http') ? img : `${origin}${img}`} />}

      {/* Article JSON-LD */}
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
}
