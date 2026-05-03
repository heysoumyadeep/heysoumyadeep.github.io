/**
 * vite-plugin-og-image.js
 *
 * Converts public/og-image.svg → dist/og-image.png at build time.
 * PNG is required by WhatsApp, iMessage, and older scrapers that don't
 * support SVG in og:image. LinkedIn and Slack accept SVG but also work
 * with PNG.
 *
 * Uses @resvg/resvg-js — a fast Rust-based SVG renderer, no browser needed.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

export default function ogImagePlugin() {
  return {
    name: 'vite-plugin-og-image',
    apply: 'build',

    async closeBundle() {
      const svgPath = resolve(process.cwd(), 'public/og-image.svg');
      const outPath = resolve(process.cwd(), 'dist/og-image.png');

      if (!existsSync(svgPath)) {
        console.warn('[og-image] public/og-image.svg not found — skipping PNG generation');
        return;
      }

      try {
        const { Resvg } = await import('@resvg/resvg-js');
        const svg = readFileSync(svgPath, 'utf-8');
        const resvg = new Resvg(svg, {
          fitTo: { mode: 'width', value: 1200 },
        });
        const png = resvg.render().asPng();
        writeFileSync(outPath, png);
        console.log('[og-image] ✓ dist/og-image.png generated (1200×630)');
      } catch (err) {
        console.warn(`[og-image] Could not generate PNG: ${err.message}`);
        console.warn('[og-image] Run: npm install @resvg/resvg-js --save-dev');
      }
    },
  };
}
