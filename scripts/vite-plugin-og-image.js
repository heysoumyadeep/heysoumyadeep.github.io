/**
 * vite-plugin-og-image.js
 *
 * Generates OG images at build time:
 *   dist/og-image.png              — homepage / fallback (from public/og-image.svg)
 *   dist/og-images/{slug}.png      — per-post image with title + excerpt
 *
 * Per-post images are rendered from an SVG template that includes:
 *   - Post title (large, bold, wrapped)
 *   - Post excerpt (smaller, muted, wrapped)
 *   - Site logo mark ("S" in crimson square)
 *   - "soumya.io" domain label
 *   - Branded dark background with accent gradient stripe
 *
 * Uses @resvg/resvg-js — Rust-based SVG renderer, no browser needed.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';

const BASE_URL    = 'https://soumya.io';
const SAFE_SLUG_RE = /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/;

// ── Frontmatter extraction ────────────────────────────────────────────────────

function extractFrontmatter(content) {
  const block = content.match(/export const frontmatter\s*=\s*\{([\s\S]*?)\};/);
  if (!block) return null;
  const get = (key) => {
    const m = block[1].match(new RegExp(`${key}:\\s*["'\`]([^"'\`\\n]{1,400})["'\`]`));
    return m ? m[1].trim() : null;
  };
  return { title: get('title'), excerpt: get('excerpt') };
}

// ── Text wrapping for SVG ─────────────────────────────────────────────────────

/**
 * Wrap text into lines that fit within maxChars characters.
 * Returns an array of line strings.
 */
function wrapText(text, maxChars) {
  if (!text) return [];
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    if ((current + ' ' + word).trim().length <= maxChars) {
      current = (current + ' ' + word).trim();
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/** Escape text for safe embedding in SVG */
function escapeSvg(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── SVG template ──────────────────────────────────────────────────────────────

function buildPostOgSvg({ title, excerpt }) {
  const safeTitle   = escapeSvg(title   ?? 'Soumyadeep Pradhan');
  const safeExcerpt = escapeSvg(excerpt ?? '');

  // Wrap title at ~38 chars, max 3 lines
  const titleLines   = wrapText(safeTitle, 38).slice(0, 3);
  // Wrap excerpt at ~72 chars, max 2 lines
  const excerptLines = wrapText(safeExcerpt, 72).slice(0, 2);

  const titleFontSize   = 56;
  const titleLineHeight = 68;
  const titleStartY     = 180;

  const excerptFontSize   = 28;
  const excerptLineHeight = 42;
  // Start excerpt below title block with 28px gap
  const excerptStartY = titleStartY + titleLines.length * titleLineHeight + 28;

  const titleSvg = titleLines
    .map((line, i) =>
      `<text x="80" y="${titleStartY + i * titleLineHeight}" font-family="Georgia, 'Times New Roman', serif" font-size="${titleFontSize}" font-weight="700" fill="#fdf6f0" letter-spacing="-1">${line}</text>`
    )
    .join('\n  ');

  const excerptSvg = excerptLines
    .map((line, i) =>
      `<text x="80" y="${excerptStartY + i * excerptLineHeight}" font-family="'Segoe UI', Arial, sans-serif" font-size="${excerptFontSize}" font-weight="400" fill="rgba(253,246,240,0.65)">${line}</text>`
    )
    .join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1c031b"/>
      <stop offset="100%" style="stop-color:#2d142c"/>
    </linearGradient>
    <linearGradient id="stripe" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#ee4540"/>
      <stop offset="50%" style="stop-color:#c72c41"/>
      <stop offset="100%" style="stop-color:#510a32"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>

  <!-- Decorative orb -->
  <circle cx="1050" cy="200" r="280" fill="rgba(238,69,64,0.07)"/>
  <circle cx="1050" cy="200" r="160" fill="rgba(199,44,65,0.09)"/>

  <!-- Accent stripe top -->
  <rect x="0" y="0" width="1200" height="5" fill="url(#stripe)"/>

  <!-- Logo mark -->
  <rect x="80" y="64" width="56" height="56" rx="12" fill="#c72c41"/>
  <text x="108" y="103" font-family="'Segoe UI', Arial, sans-serif" font-size="32" font-weight="700" fill="#2d142c" text-anchor="middle">S</text>

  <!-- Site name -->
  <text x="148" y="100" font-family="'Segoe UI', Arial, sans-serif" font-size="22" font-weight="600" fill="rgba(253,246,240,0.5)" letter-spacing="1">soumya.io</text>

  <!-- Title lines -->
  ${titleSvg}

  <!-- Excerpt lines -->
  ${excerptSvg}

  <!-- Bottom accent line -->
  <rect x="0" y="625" width="1200" height="5" fill="url(#stripe)"/>
</svg>`;
}

// ── Plugin ────────────────────────────────────────────────────────────────────

export default function ogImagePlugin() {
  return {
    name: 'vite-plugin-og-image',
    apply: 'build',

    async closeBundle() {
      const outDir   = resolve(process.cwd(), 'dist');
      const postsDir = resolve(process.cwd(), 'src/data/blog/posts');

      let Resvg;
      try {
        ({ Resvg } = await import('@resvg/resvg-js'));
      } catch {
        console.warn('[og-image] @resvg/resvg-js not found — skipping PNG generation');
        console.warn('[og-image] Run: npm install @resvg/resvg-js --save-dev');
        return;
      }

      const renderPng = (svg) => {
        const r = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
        return r.render().asPng();
      };

      // ── Homepage OG image (from public/og-image.svg) ──────────────────────
      const svgPath = resolve(process.cwd(), 'public/og-image.svg');
      if (existsSync(svgPath)) {
        try {
          const svg = readFileSync(svgPath, 'utf-8');
          writeFileSync(join(outDir, 'og-image.png'), renderPng(svg));
          console.log('[og-image] ✓ dist/og-image.png');
        } catch (err) {
          console.warn(`[og-image] Could not generate homepage PNG: ${err.message}`);
        }
      }

      // ── Per-post OG images ────────────────────────────────────────────────
      const ogImagesDir = join(outDir, 'og-images');
      mkdirSync(ogImagesDir, { recursive: true });

      let mdxFiles = [];
      try {
        mdxFiles = readdirSync(postsDir)
          .filter((f) => basename(f) === f && f.endsWith('.mdx'));
      } catch {
        console.warn('[og-image] Could not read posts directory');
      }

      for (const file of mdxFiles) {
        const rawSlug = file.replace(/\.mdx$/, '');
        const slug    = rawSlug.toLowerCase().replace(/[^a-z0-9-]/g, '');
        if (!SAFE_SLUG_RE.test(slug)) continue;

        let fm = null;
        try {
          const content = readFileSync(join(postsDir, file), 'utf-8');
          fm = extractFrontmatter(content);
        } catch {
          console.warn(`[og-image] Could not read ${file}`);
        }

        try {
          const svg = buildPostOgSvg({
            title:   fm?.title,
            excerpt: fm?.excerpt,
          });
          const png = renderPng(svg);
          writeFileSync(join(ogImagesDir, `${slug}.png`), png);
          console.log(`[og-image] ✓ dist/og-images/${slug}.png`);
        } catch (err) {
          console.warn(`[og-image] Could not generate PNG for ${slug}: ${err.message}`);
        }
      }
    },
  };
}
