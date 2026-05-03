import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mdx from '@mdx-js/rollup';
import federation from 'vite-plugin-federation';
import sitemapPlugin from './scripts/vite-plugin-sitemap.js';
import prerenderPlugin from './scripts/vite-plugin-prerender.js';
import ogImagePlugin from './scripts/vite-plugin-og-image.js';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(({ command }) => ({
  plugins: [
    { enforce: 'pre', ...mdx() },
    react(),
    // Federation only runs during build - in dev mode it hijacks the root
    // route and shows the MF debug UI instead of the actual app.
    // Also disabled when VITE_DISABLE_FEDERATION=true (e.g. GitHub Pages deploy)
    ...(command === 'build' && !process.env.VITE_DISABLE_FEDERATION ? [
      federation({
        name: 'blog-remote',
        filename: 'remoteEntry.js',
        exposes: {
          './BlogIndex':      './src/features/blog/BlogIndex.jsx',
          './BlogPostDetail': './src/features/blog/BlogPostDetail.jsx',
          './PostRepository': './src/features/blog/PostRepository.js',
          './ViewTracker':    './src/features/blog/ViewTracker.js',
        },
        shared: {
          react:              { singleton: true, requiredVersion: '^18.3.1' },
          'react-dom':        { singleton: true, requiredVersion: '^18.3.1' },
          'react-router-dom': { singleton: true, requiredVersion: '^6.26.0' },
        },
      }),
    ] : []),
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
