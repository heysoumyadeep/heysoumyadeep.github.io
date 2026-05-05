// Generates OG images at build time
//   dist/og-image.png          — homepage fallback (from public/og-image.svg)
//   dist/og-images/{slug}.png  — per-post with title + excerpt

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';

const SAFE_SLUG_RE = /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/;

function extractFrontmatter(content) {
  const block = content.match(/export const frontmatter\s*=\s*\{([\s\S]*?)\};?/);
  if (!block) return null;
  const get = (key) => {
    const m = block[1].match(new RegExp(`${key}:\\s*["'\`]([^"'\`\\n]{1,400})["'\`]`));
    return m ? m[1].trim() : null;
  };
  return { title: get('title'), excerpt: get('excerpt'), readTime: get('readTime') };
}

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

function escapeSvg(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildPostOgSvg({ title, excerpt, readTime }) {
  const safeTitle    = escapeSvg(title    ?? 'Untitled');
  const safeExcerpt  = escapeSvg(excerpt  ?? '');
  const safeReadTime = escapeSvg(readTime ?? '');

  const titleLines   = wrapText(safeTitle, 32).slice(0, 3);
  const excerptLines = wrapText(safeExcerpt, 72).slice(0, 2);

  const titleFontSize   = 64;
  const titleLineHeight = 78;
  const titleStartY     = 240;
  const excerptFontSize   = 24;
  const excerptLineHeight = 36;
  const excerptStartY = titleStartY + titleLines.length * titleLineHeight + 32;
  const metaY = 572;

  const titleSvg = titleLines
    .map((line, i) =>
      `<text x="80" y="${titleStartY + i * titleLineHeight}" font-family="Arial, sans-serif" font-size="${titleFontSize}" font-weight="700" fill="#2d142c" letter-spacing="-1.5">${line}</text>`
    ).join('\n  ');

  const excerptSvg = excerptLines
    .map((line, i) =>
      `<text x="80" y="${excerptStartY + i * excerptLineHeight}" font-family="Arial, sans-serif" font-size="${excerptFontSize}" font-weight="400" fill="rgba(45,20,44,0.55)">${line}</text>`
    ).join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#fdf6f0"/>
      <stop offset="100%" style="stop-color:#f8ecec"/>
    </linearGradient>
    <radialGradient id="orb1" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   style="stop-color:#ee4540;stop-opacity:0.28"/>
      <stop offset="60%"  style="stop-color:#c72c41;stop-opacity:0.10"/>
      <stop offset="100%" style="stop-color:#c72c41;stop-opacity:0"/>
    </radialGradient>
    <radialGradient id="orb2" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   style="stop-color:#c72c41;stop-opacity:0.20"/>
      <stop offset="60%"  style="stop-color:#801336;stop-opacity:0.07"/>
      <stop offset="100%" style="stop-color:#801336;stop-opacity:0"/>
    </radialGradient>
    <radialGradient id="orb3" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   style="stop-color:#ee4540;stop-opacity:0.15"/>
      <stop offset="100%" style="stop-color:#ee4540;stop-opacity:0"/>
    </radialGradient>
    <filter id="blur1"><feGaussianBlur stdDeviation="60"/></filter>
    <filter id="blur2"><feGaussianBlur stdDeviation="75"/></filter>
    <filter id="blur3"><feGaussianBlur stdDeviation="50"/></filter>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="1100" cy="-60" r="380" fill="url(#orb1)" filter="url(#blur1)"/>
  <circle cx="-80"  cy="480" r="340" fill="url(#orb2)" filter="url(#blur2)"/>
  <circle cx="1150" cy="660" r="300" fill="url(#orb3)" filter="url(#blur3)"/>
  <rect x="80" y="72" width="44" height="44" rx="10" fill="#c72c41"/>
  <text x="102" y="105" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#ffffff" text-anchor="middle">S</text>
  <text x="136" y="103" font-family="Arial, sans-serif" font-size="18" font-weight="600" fill="#801336" letter-spacing="0.5">soumya.io</text>
  <rect x="1068" y="72" width="52" height="22" rx="11" fill="rgba(199,44,65,0.12)"/>
  <text x="1094" y="88" font-family="Arial, sans-serif" font-size="12" font-weight="700" fill="#c72c41" text-anchor="middle" letter-spacing="0.8">BLOG</text>
  <text x="80" y="172" font-family="Arial, sans-serif" font-size="20" font-weight="400" fill="rgba(45,20,44,0.40)">Soumyadeep Pradhan · Software Engineer II</text>
  ${titleSvg}
  ${excerptSvg}
  <text x="80" y="${metaY}" font-family="Arial, sans-serif" font-size="18" font-weight="400" fill="rgba(45,20,44,0.38)">${safeReadTime ? `${safeReadTime} read` : 'soumya.io'}</text>
</svg>`;
}

async function generateOgImages(ogImagesDir, postsDir, logPrefix) {
  let Resvg;
  try {
    ({ Resvg } = await import('@resvg/resvg-js'));
  } catch {
    console.warn('[og-image] @resvg/resvg-js not found — run: npm install @resvg/resvg-js --save-dev');
    return;
  }

  const candidateFontDirs = [
    '/usr/share/fonts', '/usr/local/share/fonts',
    '/System/Library/Fonts', 'C:\\Windows\\Fonts',
  ];
  const fontDirs = candidateFontDirs.filter((dir) => existsSync(dir));

  const renderPng = (svg) => {
    const r = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 }, font: { loadSystemFonts: true, fontDirs } });
    return r.render().asPng();
  };

  mkdirSync(ogImagesDir, { recursive: true });

  let mdxFiles = [];
  try {
    mdxFiles = readdirSync(postsDir).filter((f) => basename(f) === f && f.endsWith('.mdx'));
  } catch {
    console.warn('[og-image] Could not read posts directory');
  }

  for (const file of mdxFiles) {
    const rawSlug = file.replace(/\.mdx$/, '');
    const slug    = rawSlug.toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!SAFE_SLUG_RE.test(slug)) continue;

    let fm = null;
    try {
      fm = extractFrontmatter(readFileSync(join(postsDir, file), 'utf-8'));
    } catch {
      console.warn(`[og-image] Could not read ${file}`);
    }

    try {
      const svg = buildPostOgSvg({ title: fm?.title, excerpt: fm?.excerpt, readTime: fm?.readTime });
      writeFileSync(join(ogImagesDir, `${slug}.png`), renderPng(svg));
      console.log(`[og-image] ✓ ${logPrefix}/${slug}.png`);
    } catch (err) {
      console.warn(`[og-image] Could not generate PNG for ${slug}: ${err.message}`);
    }
  }

  return renderPng;
}

export default function ogImagePlugin() {
  return {
    name: 'vite-plugin-og-image',

    // Dev: generate into public/og-images/
    async configureServer() {
      const postsDir    = resolve(process.cwd(), 'src/data/blog/posts');
      const ogImagesDir = resolve(process.cwd(), 'public/og-images');
      await generateOgImages(ogImagesDir, postsDir, 'public/og-images');
    },

    // Build: generate into dist/og-images/
    async closeBundle() {
      const outDir   = resolve(process.cwd(), 'dist');
      const postsDir = resolve(process.cwd(), 'src/data/blog/posts');

      let Resvg;
      try {
        ({ Resvg } = await import('@resvg/resvg-js'));
      } catch {
        console.warn('[og-image] @resvg/resvg-js not found — run: npm install @resvg/resvg-js --save-dev');
        return;
      }

      const candidateFontDirs = [
        '/usr/share/fonts', '/usr/local/share/fonts',
        '/System/Library/Fonts', 'C:\\Windows\\Fonts',
      ];
      const fontDirs = candidateFontDirs.filter((dir) => existsSync(dir));

      const renderPng = (svg) => {
        const r = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 }, font: { loadSystemFonts: true, fontDirs } });
        return r.render().asPng();
      };

      // Homepage OG image
      const svgPath = resolve(process.cwd(), 'public/og-image.svg');
      if (existsSync(svgPath)) {
        try {
          writeFileSync(join(outDir, 'og-image.png'), renderPng(readFileSync(svgPath, 'utf-8')));
          console.log('[og-image] ✓ dist/og-image.png');
        } catch (err) {
          console.warn(`[og-image] Could not generate homepage PNG: ${err.message}`);
        }
      }

      // Per-post OG images
      await generateOgImages(join(outDir, 'og-images'), postsDir, 'dist/og-images');
    },
  };
}
