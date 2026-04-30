/**
 * vite-plugin-sitemap.js
 *
 * Generates sitemap.xml at build time from MDX post files.
 *
 * Security hardening:
 *  - Path traversal: only files directly inside postsDir are processed
 *    (no subdirectory traversal via path.basename check)
 *  - URL injection: all <loc> values are built from a whitelist of known
 *    slugs derived from filenames — never from file content
 *  - XML injection: slug characters are validated against [a-z0-9-] before
 *    being written into the XML
 *  - Date injection: extracted dates are validated via Date.parse before use;
 *    invalid dates fall back to today's date
 */

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';

const BASE_URL = 'https://soumya.io';

// Only allow slugs that are safe URL path segments
const SAFE_SLUG_RE = /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/;

function sanitizeSlug(raw) {
  const slug = raw.toLowerCase().replace(/[^a-z0-9-]/g, '');
  return SAFE_SLUG_RE.test(slug) ? slug : null;
}

function extractDate(content) {
  // Match only the first occurrence of date: "..." in the frontmatter block
  const match = content.match(/^export const frontmatter[\s\S]*?date:\s*["']([^"'\n]{1,40})["']/m);
  if (!match) return null;
  const ts = Date.parse(match[1]);
  if (isNaN(ts)) return null;
  return new Date(ts).toISOString().split('T')[0];
}

// Escape XML special characters to prevent XML injection
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
      const outDir = resolve(process.cwd(), 'dist');
      const today = new Date().toISOString().split('T')[0];

      let mdxFiles = [];
      try {
        mdxFiles = readdirSync(postsDir)
          .filter((f) => {
            // Only direct children, no path separators (prevents traversal)
            const name = basename(f);
            return name === f && name.endsWith('.mdx');
          });
      } catch {
        console.warn('[sitemap] Could not read posts directory');
      }

      const entries = [
        urlEntry({ loc: BASE_URL, lastmod: today, changefreq: 'monthly', priority: '1.0' }),
        urlEntry({ loc: `${BASE_URL}/blog`, lastmod: today, changefreq: 'weekly', priority: '0.9' }),
      ];

      for (const file of mdxFiles) {
        const rawSlug = file.replace(/\.mdx$/, '');
        const slug = sanitizeSlug(rawSlug);
        if (!slug) {
          console.warn(`[sitemap] Skipping unsafe slug: "${rawSlug}"`);
          continue;
        }

        let lastmod = today;
        try {
          const content = readFileSync(join(postsDir, file), 'utf-8');
          lastmod = extractDate(content) || today;
        } catch {
          console.warn(`[sitemap] Could not read ${file}, using today's date`);
        }

        entries.push(urlEntry({
          loc: `${BASE_URL}/blog/${slug}`,
          lastmod,
          changefreq: 'yearly',
          priority: '0.8',
        }));
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
