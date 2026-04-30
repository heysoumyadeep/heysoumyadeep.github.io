/**
 * vite-plugin-prerender.js
 *
 * After build, copies dist/index.html to each route directory so every URL
 * serves HTML immediately — critical for crawlers that don't execute JS.
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

export default function prerenderPlugin() {
  return {
    name: 'vite-plugin-prerender',
    apply: 'build',

    closeBundle() {
      const outDir = resolve(process.cwd(), 'dist');
      const postsDir = resolve(process.cwd(), 'src/data/blog/posts');

      let html;
      try {
        html = readFileSync(join(outDir, 'index.html'), 'utf-8');
      } catch {
        console.warn('[prerender] Could not read dist/index.html — skipping');
        return;
      }

      // Static routes + auto-discovered blog post routes
      const slugs = getPostSlugs(postsDir);
      const routes = [
        'blog',
        ...slugs.map((slug) => `blog/${slug}`),
      ];

      for (const route of routes) {
        const dir = join(outDir, route);
        try {
          mkdirSync(dir, { recursive: true });
          writeFileSync(join(dir, 'index.html'), html, 'utf-8');
          console.log(`[prerender] ✓ dist/${route}/index.html`);
        } catch (err) {
          console.warn(`[prerender] ✗ dist/${route}/index.html — ${err.message}`);
        }
      }

      // Netlify
      writeFileSync(join(outDir, '_redirects'), '/*  /index.html  200\n', 'utf-8');
      console.log('[prerender] ✓ dist/_redirects');

      // Vercel
      writeFileSync(
        join(outDir, 'vercel.json'),
        JSON.stringify({ rewrites: [{ source: '/(.*)', destination: '/index.html' }] }, null, 2) + '\n',
        'utf-8'
      );
      console.log('[prerender] ✓ dist/vercel.json');

      console.log(`\n[prerender] ✓ ${routes.length} routes pre-rendered`);
    },
  };
}
