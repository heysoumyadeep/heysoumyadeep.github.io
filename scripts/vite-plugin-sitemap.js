// Generates sitemap.xml at build time from MDX post files
// Security: path traversal prevention, URL injection guard, XML escaping, date validation

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';

const BASE_URL      = 'https://soumya.io';
const SAFE_SLUG_RE  = /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/;

function sanitizeSlug(raw) {
  const slug = raw.toLowerCase().replace(/[^a-z0-9-]/g, '');
  return SAFE_SLUG_RE.test(slug) ? slug : null;
}

function extractDate(content) {
  const match = content.match(/^export const frontmatter[\s\S]*?date:\s*["']([^"'\n]{1,40})["']/m);
  if (!match) return null;
  const ts = Date.parse(match[1]);
  if (isNaN(ts)) return null;
  return new Date(ts).toISOString().split('T')[0];
}

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function urlEntry({ loc, lastmod, changefreq, priority }) {
  return [
    '  <url>',
    `    <loc>${escapeXml(loc)}</loc>`,
    lastmod ? `    <lastmod>${escapeXml(lastmod)}</lastmod>` : null,
    `    <changefreq>${escapeXml(changefreq)}</changefreq>`,
    `    <priority>${escapeXml(priority)}</priority>`,
    '  </url>',
  ].filter(Boolean).join('\n');
}

export default function sitemapPlugin() {
  return {
    name: 'vite-plugin-sitemap',
    apply: 'build',

    closeBundle() {
      const postsDir = resolve(process.cwd(), 'src/data/blog/posts');
      const outDir   = resolve(process.cwd(), 'dist');
      const today    = new Date().toISOString().split('T')[0];

      let mdxFiles = [];
      try {
        mdxFiles = readdirSync(postsDir).filter((f) => basename(f) === f && f.endsWith('.mdx'));
      } catch {
        console.warn('[sitemap] Could not read posts directory');
      }

      const entries = [
        urlEntry({ loc: BASE_URL, lastmod: today, changefreq: 'monthly', priority: '1.0' }),
        urlEntry({ loc: `${BASE_URL}/blog`, lastmod: today, changefreq: 'weekly', priority: '0.9' }),
      ];

      for (const file of mdxFiles) {
        const slug = sanitizeSlug(file.replace(/\.mdx$/, ''));
        if (!slug) { console.warn(`[sitemap] Skipping unsafe slug: "${file}"`); continue; }

        let lastmod = today;
        try {
          const content = readFileSync(join(postsDir, file), 'utf-8');
          lastmod = extractDate(content) || today;
        } catch {
          console.warn(`[sitemap] Could not read ${file}, using today's date`);
        }

        entries.push(urlEntry({ loc: `${BASE_URL}/blog/${slug}`, lastmod, changefreq: 'yearly', priority: '0.8' }));
      }

      const sitemap = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...entries,
        '</urlset>',
      ].join('\n');

      writeFileSync(join(outDir, 'sitemap.xml'), sitemap, 'utf-8');
      console.log(`\n[sitemap] ✓ Generated dist/sitemap.xml (${entries.length} URLs)`);
    },
  };
}
