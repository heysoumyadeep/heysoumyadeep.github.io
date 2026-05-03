/**
 * vite-plugin-prerender.js
 *
 * After build, copies dist/index.html to each route directory so every URL
 * serves HTML immediately — critical for crawlers that don't execute JS.
 *
 * Per-route OG/Twitter meta tags are injected so that link previews on
 * LinkedIn, WhatsApp, Slack, Twitter etc. show the correct title, description,
 * and image for each blog post rather than the generic homepage values.
 *
 * Routes are auto-discovered from the MDX posts directory, so adding a new
 * post automatically gets a pre-rendered route with no manual config needed.
 *
 * Also writes platform SPA routing files:
 *   dist/_redirects  → Netlify
 *   dist/vercel.json → Vercel
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';

const BASE_URL = 'https://soumya.io';
const SAFE_SLUG_RE = /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/;

function getPostSlugs(postsDir) {
  try {
    return readdirSync(postsDir)
      .filter((f) => basename(f) === f && f.endsWith('.mdx'))
      .map((f) => f.replace(/\.mdx$/, '').toLowerCase().replace(/[^a-z0-9-]/g, ''))
      .filter((slug) => SAFE_SLUG_RE.test(slug));
  } catch {
    return [];
  }
}

/**
 * Extract frontmatter fields from raw MDX content.
 * Returns { title, excerpt, date, tags } or null if not found.
 */
function extractFrontmatter(content) {
  const block = content.match(/export const frontmatter\s*=\s*\{([\s\S]*?)\};/);
  if (!block) return null;

  const get = (key) => {
    const m = block[1].match(new RegExp(`${key}:\\s*["'\`]([^"'\`\\n]{1,300})["'\`]`));
    return m ? m[1].trim() : null;
  };

  const tagsMatch = block[1].match(/tags:\s*\[([^\]]*)\]/);
  const tags = tagsMatch
    ? tagsMatch[1].match(/["']([^"']+)["']/g)?.map((t) => t.replace(/["']/g, '')) ?? []
    : [];

  return {
    title:   get('title'),
    excerpt: get('excerpt'),
    date:    get('date'),
    tags,
  };
}

/**
 * Escape a string for safe use inside an HTML attribute value.
 */
function escapeAttr(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Replace the OG / Twitter meta tags in the base HTML with per-route values.
 * Only replaces the tags that differ per page; everything else is left intact.
 */
function injectOgTags(html, { title, description, url, image, type = 'article' }) {
  const safeTitle       = escapeAttr(title);
  const safeDescription = escapeAttr(description);
  const safeUrl         = escapeAttr(url);
  const safeImage       = escapeAttr(image);

  // Replace <title>
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${safeTitle}</title>`
  );

  // Replace <meta name="description">
  html = html.replace(
    /<meta name="description" content="[^"]*"/,
    `<meta name="description" content="${safeDescription}"`
  );

  // Replace <link rel="canonical">
  html = html.replace(
    /<link rel="canonical" href="[^"]*"/,
    `<link rel="canonical" href="${safeUrl}"`
  );

  // Replace OG tags
  const ogReplacements = {
    'og:type':        type,
    'og:title':       safeTitle,
    'og:description': safeDescription,
    'og:url':         safeUrl,
    'og:image':       safeImage,
  };

  for (const [prop, value] of Object.entries(ogReplacements)) {
    html = html.replace(
      new RegExp(`(<meta property="${prop.replace(':', '\\:')}") content="[^"]*"`),
      `$1 content="${value}"`
    );
  }

  // Replace Twitter tags
  const twitterReplacements = {
    'twitter:title':       safeTitle,
    'twitter:description': safeDescription,
    'twitter:image':       safeImage,
  };

  for (const [name, value] of Object.entries(twitterReplacements)) {
    html = html.replace(
      new RegExp(`(<meta name="${name}") content="[^"]*"`),
      `$1 content="${value}"`
    );
  }

  return html;
}

export default function prerenderPlugin() {
  return {
    name: 'vite-plugin-prerender',
    apply: 'build',

    closeBundle() {
      const outDir   = resolve(process.cwd(), 'dist');
      const postsDir = resolve(process.cwd(), 'src/data/blog/posts');

      let baseHtml;
      try {
        baseHtml = readFileSync(join(outDir, 'index.html'), 'utf-8');
      } catch {
        console.warn('[prerender] Could not read dist/index.html — skipping');
        return;
      }

      const slugs = getPostSlugs(postsDir);

      // ── /blog index ──────────────────────────────────────────────────────────
      const blogDir = join(outDir, 'blog');
      mkdirSync(blogDir, { recursive: true });
      const blogHtml = injectOgTags(baseHtml, {
        title:       'Blog | Soumyadeep Pradhan',
        description: 'Notes on engineering, software craft, and the occasional detour into other things. By Soumyadeep Pradhan, Full-Stack Developer at JPMorgan Chase.',
        url:         `${BASE_URL}/blog`,
        image:       `${BASE_URL}/og-image.png`,
        type:        'website',
      });
      writeFileSync(join(blogDir, 'index.html'), blogHtml, 'utf-8');
      console.log('[prerender] ✓ dist/blog/index.html');

      // ── Per-post routes ───────────────────────────────────────────────────────
      for (const slug of slugs) {
        // Try to read frontmatter for this post
        let fm = null;
        try {
          const content = readFileSync(join(postsDir, `${slug}.mdx`), 'utf-8');
          fm = extractFrontmatter(content);
        } catch {
          console.warn(`[prerender] Could not read frontmatter for ${slug}`);
        }

        const postTitle       = fm?.title   ? `${fm.title} | Soumyadeep Pradhan` : 'Soumyadeep Pradhan';
        const postDescription = fm?.excerpt ?? 'Read this article on soumya.io';
        const postUrl         = `${BASE_URL}/blog/${slug}`;
        const postImage       = `${BASE_URL}/og-image.png`;

        const postHtml = injectOgTags(baseHtml, {
          title:       postTitle,
          description: postDescription,
          url:         postUrl,
          image:       postImage,
          type:        'article',
        });

        const dir = join(outDir, 'blog', slug);
        mkdirSync(dir, { recursive: true });
        writeFileSync(join(dir, 'index.html'), postHtml, 'utf-8');
        console.log(`[prerender] ✓ dist/blog/${slug}/index.html`);
      }

      // ── SPA routing files ─────────────────────────────────────────────────────
      writeFileSync(join(outDir, '_redirects'), '/*  /index.html  200\n', 'utf-8');
      console.log('[prerender] ✓ dist/_redirects');

      writeFileSync(
        join(outDir, 'vercel.json'),
        JSON.stringify({ rewrites: [{ source: '/(.*)', destination: '/index.html' }] }, null, 2) + '\n',
        'utf-8'
      );
      console.log('[prerender] ✓ dist/vercel.json');

      console.log(`\n[prerender] ✓ ${slugs.length + 1} routes pre-rendered with per-page OG tags`);
    },
  };
}
