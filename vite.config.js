import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mdx from '@mdx-js/rollup';
import sitemapPlugin from './scripts/vite-plugin-sitemap.js';
import prerenderPlugin from './scripts/vite-plugin-prerender.js';
import ogImagePlugin from './scripts/vite-plugin-og-image.js';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(({ command }) => ({
  plugins: [
    { enforce: 'pre', ...mdx() },
    react(),
    // Sitemap + prerender + OG image always run on build
    ...(command === 'build' ? [
      ogImagePlugin(),
      sitemapPlugin(),
      prerenderPlugin(),
    ] : []),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@app': fileURLToPath(new URL('./src/app', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/site-container', import.meta.url)),
      '@config': fileURLToPath(new URL('./src/config', import.meta.url)),
      '@features': fileURLToPath(new URL('./src/features', import.meta.url)),
      '@hooks': fileURLToPath(new URL('./src/hooks', import.meta.url)),
      '@pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
      '@styles': fileURLToPath(new URL('./src/styles', import.meta.url)),
      '@data': fileURLToPath(new URL('./src/data', import.meta.url)),
    },
  },
  build: {
    target: 'esnext',
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
  server: { port: 3000, open: true },
}));
