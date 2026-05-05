import { Helmet } from 'react-helmet-async';
import { SITE_CONFIG } from '@config/site';

const BASE_URL        = SITE_CONFIG.url;
const AUTHOR          = SITE_CONFIG.name;
const TWITTER_HANDLE  = '@heysoumyadeep';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;
const DEFAULT_OG_ALT   = `${AUTHOR} - Full-Stack Developer`;

export default function SEO({
  title,
  description,
  canonical,
  image = DEFAULT_OG_IMAGE,
  imageAlt,
  type = 'website',
  article,
  schema,
}) {
  const fullTitle    = title ? `${title} | ${AUTHOR}` : `${AUTHOR} - Full-Stack Developer`;
  const canonicalUrl = canonical ? `${BASE_URL}${canonical}` : BASE_URL;
  const ogImageAlt   = imageAlt || (title ? `${title} | ${AUTHOR}` : DEFAULT_OG_ALT);

  const schemas = schema ? (Array.isArray(schema) ? schema : [schema]) : [];

  const publishedTime = article?.publishedTime;
  const modifiedTime  = article?.modifiedTime || publishedTime;

  return (
    <Helmet>
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <meta name="bingbot" content="index, follow" />
      <meta name="slurp" content="index, follow" />

      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="author" content={AUTHOR} />
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={image} />
      <meta property="og:image:secure_url" content={image} />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={ogImageAlt} />
      <meta property="og:site_name" content={AUTHOR} />
      <meta property="og:locale" content="en_US" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={TWITTER_HANDLE} />
      <meta name="twitter:creator" content={TWITTER_HANDLE} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={ogImageAlt} />

      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime  && <meta property="article:modified_time" content={modifiedTime} />}
      {article?.author && <meta property="article:author" content={article.author} />}
      {(article?.tags ?? []).map((tag) => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}

      {schemas.map((s, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }}
        />
      ))}
    </Helmet>
  );
}
