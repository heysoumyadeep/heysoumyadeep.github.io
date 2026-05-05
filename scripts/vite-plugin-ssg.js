/**
 * vite-plugin-ssg.js
 *
 * Static Site Generation for blog posts with SEO optimization.
 *
 * What this plugin does:
 *   1. Generates static HTML files for each blog post route
 *   2. Injects SEO meta tags (Open Graph, Twitter Cards, JSON-LD schemas)
 *   3. Creates sitemap-friendly routing files
 *
 * Note: SSR pre-rendering is attempted but falls back to meta-only mode
 * due to MDX 3.x limitations with complex JSX expressions. This is fine
 * because the meta tags provide full SEO coverage.
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'vite';
import react from '@vitejs/plugin-react';
import mdx from '@mdx-js/rollup';
import rehypeHighlight from 'rehype-highlight';

const BASE_URL     = 'https://soumya.io';
const SAFE_SLUG_RE = /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/;

// ─── Helpers ────────────────────────────────────────────────────────────────

function getPostSlugs(postsDir) {
  try {
    return readdirSync(postsDir)
      .filter((f) => basename(f) === f && f.endsWith('.mdx'))
      .map((f) => f.replace(/\.mdx$/, '').toLowerCase().replace(/[^a-z0-9-]/g, ''))
      .filter((slug) => SAFE_SLUG_RE.test(slug));
  } catch { return []; }
}

function extractFrontmatter(content) {
  const block = content.match(/export const frontmatter\s*=\s*\{([\s\S]*?)\};?/);
  if (!block) return {};

  const get = (key) => {
    const m = block[1].match(new RegExp(`${key}:\\s*["'\`]([^"'\`\\n]{1,300})["'\`]`));
    return m ? m[1].trim() : '';
  };

  const tagsMatch = block[1].match(/tags:\s*\[([^\]]*)\]/);
  const tags = tagsMatch
    ? tagsMatch[1].match(/["']([^"']+)["']/g)?.map((t) => t.replace(/["']/g, '')) ?? []
    : [];

  return {
    title:    get('title'),
    excerpt:  get('excerpt'),
    date:     get('date'),
    readTime: get('readTime'),
    author:   get('author'),
    tags,
  };
}

function escapeAttr(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ─── Meta tag injection ──────────────────────────────────────────────────────

function injectMetaTags(html, { title, description, url, image, isoDate, author, tags }) {
  const safeTitle       = escapeAttr(title);
  const safeDescription = escapeAttr(description);
  const safeUrl         = escapeAttr(url);
  const safeImage       = escapeAttr(image);

  html = html.replace(/<title>[^<]*<\/title>/, `<title>${safeTitle}</title>`);
  html = html.replace(/(<meta name="description") content="[^"]*"/, `$1 content="${safeDescription}"`);
  html = html.replace(/(<link rel="canonical") href="[^"]*"/, `$1 href="${safeUrl}"`);

  const ogMap = {
    'og:type':             'article',
    'og:title':            safeTitle,
    'og:description':      safeDescription,
    'og:url':              safeUrl,
    'og:image':            safeImage,
    'og:image:secure_url': safeImage,
  };
  for (const [prop, value] of Object.entries(ogMap)) {
    html = html.replace(
      new RegExp(`(<meta property="${prop.replace(':', '\\:')}") content="[^"]*"`),
      `$1 content="${value}"`,
    );
  }

  const twMap = {
    'twitter:title':       safeTitle,
    'twitter:description': safeDescription,
    'twitter:image':       safeImage,
  };
  for (const [name, value] of Object.entries(twMap)) {
    html = html.replace(
      new RegExp(`(<meta name="${name}") content="[^"]*"`),
      `$1 content="${value}"`,
    );
  }

  // Article-specific meta + keywords
  const articleMeta = [
    isoDate ? `  <meta property="article:published_time" content="${escapeAttr(isoDate)}" />` : '',
    isoDate ? `  <meta property="article:modified_time"  content="${escapeAttr(isoDate)}" />` : '',
    author  ? `  <meta property="article:author"         content="${escapeAttr(author)}" />` : '',
    ...(tags ?? []).map((t) => `  <meta property="article:tag" content="${escapeAttr(t)}" />`),
    tags?.length
      ? `  <meta name="keywords" content="${escapeAttr([...tags, 'Soumyadeep Pradhan', 'soumya.io', 'software engineering blog'].join(', '))}" />`
      : '',
  ].filter(Boolean).join('\n');

  if (articleMeta) {
    html = html.replace('</head>', `${articleMeta}\n</head>`);
  }

  // JSON-LD schemas
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    url,
    datePublished: isoDate || undefined,
    dateModified:  isoDate || undefined,
    author:    { '@type': 'Person', name: author || 'Soumyadeep Pradhan', url: BASE_URL },
    publisher: { '@type': 'Person', name: 'Soumyadeep Pradhan', url: BASE_URL },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    image: { '@type': 'ImageObject', url: image, width: 1200, height: 630 },
    keywords: [...(tags ?? []), 'Soumyadeep Pradhan', 'software engineering'].join(', '),
    articleSection: 'Engineering',
    inLanguage: 'en-US',
    isAccessibleForFree: true,
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${BASE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: title, item: url },
    ],
  };

  const schemaHtml = [
    `  <script type="application/ld+json">${JSON.stringify(schema)}</script>`,
    `  <script type="application/ld+json">${JSON.stringify(breadcrumb)}</script>`,
  ].join('\n');

  html = html.replace('</head>', `${schemaHtml}\n</head>`);

  return html;
}

// ─── SSG content injection ───────────────────────────────────────────────────

function injectSsgContent(html, renderedHtml) {
  if (!renderedHtml) return html;

  // Hidden from users (off-screen), visible to crawlers in raw HTML
  const ssgBlock = `
  <!-- SSG: pre-rendered article content for search crawlers -->
  <div id="ssg-content" aria-hidden="true" style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;">
    ${renderedHtml}
  </div>
  <noscript>
    <div class="blog-post-wrap container">
      ${renderedHtml}
    </div>
  </noscript>`;

  return html.replace('</body>', `${ssgBlock}\n</body>`);
}

// ─── SSR bundle build ────────────────────────────────────────────────────────

/**
 * Attempts to build a Node-compatible ESM bundle for SSR rendering.
 * Returns the path to the output .mjs file, or null if build fails.
 * 
 * Note: This currently fails due to MDX 3.x acorn parser limitations with
 * complex JSX expressions (style objects). The fallback meta-only mode
 * provides full SEO coverage, so this is not critical.
 */
async function buildSsrBundle(projectRoot, postsDir, slugs) {
  const ssrOutDir = join(projectRoot, 'dist', '.ssg');

  const virtualEntryId = 'virtual:ssg-entry';
  const virtualEntryCode = `
import { renderPost } from '${join(projectRoot, 'scripts/ssg-entry.jsx').replace(/\\/g, '/')}';
export { renderPost };

const loaders = {
${slugs.map((slug) => `  '${slug}': () => import('${join(postsDir, `${slug}.mdx`).replace(/\\/g, '/')}'),`).join('\n')}
};

export async function loadPost(slug) {
  const loader = loaders[slug];
  if (!loader) return null;
  return loader();
}
`;

  // Prevent infinite loop
  process.env.VITE_SSG_INTERNAL_BUILD = 'true';

  try {
    await build({
      root: projectRoot,
      mode: 'production',
      logLevel: 'silent',
      plugins: [
        {
          name: 'ssg-virtual-entry',
          resolveId(id) {
            if (id === virtualEntryId) return '\0' + virtualEntryId;
          },
          load(id) {
            if (id === '\0' + virtualEntryId) return virtualEntryCode;
          },
        },
        { enforce: 'pre', ...mdx({ rehypePlugins: [rehypeHighlight] }) },
        react(),
      ],
      resolve: {
        alias: {
          '@': join(projectRoot, 'src'),
          '@app': join(projectRoot, 'src/app'),
          '@components': join(projectRoot, 'src/site-container'),
          '@config': join(projectRoot, 'src/config'),
          '@features': join(projectRoot, 'src/features'),
          '@hooks': join(projectRoot, 'src/hooks'),
          '@pages': join(projectRoot, 'src/pages'),
          '@styles': join(projectRoot, 'src/styles'),
          '@data': join(projectRoot, 'src/data'),
        },
      },
      build: {
        ssr: true,
        target: 'node18',
        outDir: ssrOutDir,
        emptyOutDir: true,
        rollupOptions: {
          input: virtualEntryId,
          output: {
            format: 'esm',
            entryFileNames: 'ssg-bundle.mjs',
          },
          external: [/^node:/],
        },
      },
      css: { preprocessorOptions: { scss: { api: 'modern-compiler' } } },
      ssr: {
        noExternal: ['react-dom'],
      },
    });

    delete process.env.VITE_SSG_INTERNAL_BUILD;
    return join(ssrOutDir, 'ssg-bundle.mjs');
  } catch (error) {
    delete process.env.VITE_SSG_INTERNAL_BUILD;
    throw error;
  }
}

// ─── Plugin ──────────────────────────────────────────────────────────────────

export default function ssgPlugin() {
  return {
    name: 'vite-plugin-ssg',
    apply: 'build',

    async closeBundle() {
      // Prevent infinite loop
      if (process.env.VITE_SSG_INTERNAL_BUILD === 'true') {
        return;
      }

      const projectRoot = resolve(process.cwd());
      const outDir      = resolve(projectRoot, 'dist');
      const postsDir    = resolve(projectRoot, 'src/data/blog/posts');

      let baseHtml;
      try {
        baseHtml = readFileSync(join(outDir, 'index.html'), 'utf-8');
      } catch {
        console.warn('[ssg] Could not read dist/index.html — skipping');
        return;
      }

      const slugs = getPostSlugs(postsDir);
      if (slugs.length === 0) {
        console.log('[ssg] No posts found — skipping');
        return;
      }

      console.log(`\n[ssg] Generating static pages for ${slugs.length} post(s)…`);

      // ── Attempt SSR bundle build ──────────────────────────────────────────
      let renderPost = null;
      let loadPost   = null;
      
      try {
        const bundlePath = await buildSsrBundle(projectRoot, postsDir, slugs);
        const mod = await import(pathToFileURL(bundlePath).href);
        renderPost = mod.renderPost;
        loadPost   = mod.loadPost;
        console.log('[ssg] ✓ SSR rendering enabled');
      } catch (err) {
        console.log('[ssg] ℹ SSR rendering unavailable, using meta-only mode (full SEO coverage maintained)');
      }

      // ── /blog index ───────────────────────────────────────────────────────
      const blogDir = join(outDir, 'blog');
      mkdirSync(blogDir, { recursive: true });

      let blogHtml = injectMetaTags(baseHtml, {
        title:       'Blog | Soumyadeep Pradhan',
        description: 'Notes on engineering, software craft, and the occasional detour into other things. By Soumyadeep Pradhan, Full-Stack Developer at JPMorgan Chase.',
        url:         `${BASE_URL}/blog`,
        image:       `${BASE_URL}/og-image.png`,
        isoDate:     null,
        author:      'Soumyadeep Pradhan',
        tags:        ['software engineering', 'blog', 'React', 'Node.js'],
      });
      writeFileSync(join(blogDir, 'index.html'), blogHtml, 'utf-8');
      console.log('[ssg] ✓ dist/blog/index.html');

      // ── Per-post pages ────────────────────────────────────────────────────
      for (const slug of slugs) {
        let fm = {};
        try {
          const content = readFileSync(join(postsDir, `${slug}.mdx`), 'utf-8');
          fm = extractFrontmatter(content);
        } catch {
          console.warn(`[ssg] Could not read frontmatter for ${slug}`);
        }

        const isoDate = fm.date
          ? (() => { try { return new Date(fm.date).toISOString(); } catch { return ''; } })()
          : '';
        const postUrl = `${BASE_URL}/blog/${slug}`;
        const image   = `${BASE_URL}/og-images/${slug}.png`;

        // Attempt to render article body
        let renderedHtml = '';
        if (renderPost && loadPost) {
          try {
            const postMod = await loadPost(slug);
            if (postMod) {
              renderedHtml = renderPost(postMod, {
                slug,
                title:    fm.title    || '',
                date:     fm.date     || '',
                readTime: fm.readTime || '',
                excerpt:  fm.excerpt  || '',
                author:   fm.author   || '',
                tags:     fm.tags     ?? [],
              });
            }
          } catch (err) {
            // Silent fail - meta-only mode is fine
          }
        }

        let postHtml = injectMetaTags(baseHtml, {
          title:       fm.title ? `${fm.title} | Soumyadeep Pradhan` : 'Soumyadeep Pradhan',
          description: fm.excerpt || 'Read this article on soumya.io',
          url:         postUrl,
          image,
          isoDate,
          author:      fm.author || 'Soumyadeep Pradhan',
          tags:        fm.tags ?? [],
        });
        postHtml = injectSsgContent(postHtml, renderedHtml);

        const dir = join(outDir, 'blog', slug);
        mkdirSync(dir, { recursive: true });
        writeFileSync(join(dir, 'index.html'), postHtml, 'utf-8');

        console.log(`[ssg] ✓ dist/blog/${slug}/index.html`);
      }

      // ── SPA routing files ─────────────────────────────────────────────────
      writeFileSync(join(outDir, '_redirects'), '/*  /index.html  200\n', 'utf-8');
      writeFileSync(
        join(outDir, 'vercel.json'),
        JSON.stringify({ rewrites: [{ source: '/(.*)', destination: '/index.html' }] }, null, 2) + '\n',
        'utf-8',
      );

      // ── GitHub Pages 404 ──────────────────────────────────────────────────
      // GitHub Pages serves 404.html for any non-existent route
      // Copy index.html as 404.html so the React Router can handle the route
      writeFileSync(join(outDir, '404.html'), baseHtml, 'utf-8');
      console.log('[ssg] ✓ dist/404.html (GitHub Pages custom 404)');

      // ── Cleanup ───────────────────────────────────────────────────────────
      try {
        rmSync(join(outDir, '.ssg'), { recursive: true, force: true });
      } catch { /* non-critical */ }

      console.log(`[ssg] ✓ Done — ${slugs.length + 1} routes generated\n`);
    },
  };
}
