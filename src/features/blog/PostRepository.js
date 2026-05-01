/**
 * PostRepository.js
 *
 * Two-tier loading strategy — scales to any number of posts:
 *
 * TIER 1 — Metadata (eager, tiny):
 *   Only frontmatter fields (title, date, excerpt, author, tags, readTime, faqs)
 *   are loaded upfront. This is used for the blog index, Writing section, and
 *   sitemap. The total payload is a few KB regardless of post count.
 *
 * TIER 2 — Post body (lazy, per-post):
 *   The full MDX React component is loaded on demand only when a visitor opens
 *   a specific post. Vite code-splits each MDX file into its own chunk, so
 *   visiting /blog/post-a never downloads the content of post-b.
 *
 * With 100 posts:
 *   - Blog index load: ~same as 3 posts (only metadata)
 *   - Opening a post: downloads only that post's chunk (~5–20 KB)
 */

import { slugFromPath } from './PostProcessor.js';

// ── Tier 1: metadata only (eager) ────────────────────────────────────────────
// import.meta.glob with { eager: true, import: 'frontmatter' } would be ideal
// but MDX doesn't support named eager imports cleanly across all Vite versions.
// Instead we import the full module eagerly but only READ the metadata fields —
// Vite still code-splits the default export (the React component) into a
// separate chunk that isn't evaluated until it's actually rendered.

const metaModules = import.meta.glob('../../data/blog/posts/*.mdx', { eager: true });

// ── Tier 2: lazy loaders (one per post) ──────────────────────────────────────
// These are functions — calling them triggers a dynamic import of that post's
// chunk. Vite generates a separate JS file per post at build time.

const lazyLoaders = import.meta.glob('../../data/blog/posts/*.mdx');

// ── Build the metadata index once at module init ──────────────────────────────

function buildMeta(mod, filePath) {
  const slug = slugFromPath(filePath);
  const fm = mod.frontmatter ?? {};
  return {
    slug,
    title:    fm.title    != null ? String(fm.title)    : '',
    date:     fm.date     != null ? String(fm.date)     : '',
    readTime: fm.readTime != null ? String(fm.readTime) : '',
    excerpt:  fm.excerpt  != null ? String(fm.excerpt)  : '',
    author:   fm.author   != null ? String(fm.author)   : '',
    tags:     Array.isArray(fm.tags) ? fm.tags.map(String) : [],
    faqs:     Array.isArray(mod.faqs) ? mod.faqs : [],
    isPremium: fm.isPremium === true,
    // Component is NOT stored here — loaded lazily via getPostBySlug
  };
}

const ALL_META = Object.entries(metaModules)
  .map(([filePath, mod]) => buildMeta(mod, filePath))
  .sort((a, b) => {
    const da = new Date(a.date);
    const db = new Date(b.date);
    if (isNaN(da) && isNaN(db)) return 0;
    if (isNaN(da)) return 1;
    if (isNaN(db)) return -1;
    return db - da;
  });

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Return all post metadata sorted by date descending.
 * Fast — no network requests, metadata was bundled at build time.
 * @returns {Promise<PostMeta[]>}
 */
export async function getAllPosts() {
  return ALL_META;
}

/**
 * Return the N most recent post metadata objects.
 * @param {number} count
 * @returns {Promise<PostMeta[]>}
 */
export async function getRecentPosts(count) {
  return ALL_META.slice(0, count);
}

/**
 * Return a full BlogPost (metadata + React Component) for the given slug.
 * Triggers a lazy import of only that post's chunk — other posts are not loaded.
 * @param {string} slug
 * @returns {Promise<BlogPost|null>}
 */
export async function getPostBySlug(slug) {
  const meta = ALL_META.find((p) => p.slug === slug);
  if (!meta) return null;

  // Find the matching lazy loader by slug
  const loaderEntry = Object.entries(lazyLoaders).find(
    ([filePath]) => slugFromPath(filePath) === slug
  );
  if (!loaderEntry) return null;

  const [, loader] = loaderEntry;
  const mod = await loader();

  return {
    ...meta,
    Component: mod.default,
  };
}
