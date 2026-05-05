// Two-tier loading:
//   Tier 1 — metadata only, eager (used for index + writing section)
//   Tier 2 — full MDX component, lazy per-post (loaded on demand)

import { slugFromPath } from './PostProcessor.js';

const metaModules  = import.meta.glob('../../data/blog/posts/*.mdx', { eager: true });
const lazyLoaders  = import.meta.glob('../../data/blog/posts/*.mdx');

function buildMeta(mod, filePath) {
  const slug = slugFromPath(filePath);
  const fm = mod.frontmatter ?? {};
  return {
    slug,
    title:        fm.title      != null ? String(fm.title)      : '',
    date:         fm.date       != null ? String(fm.date)       : '',
    readTime:     fm.readTime   != null ? String(fm.readTime)   : '',
    excerpt:      fm.excerpt    != null ? String(fm.excerpt)    : '',
    author:       fm.author     != null ? String(fm.author)     : '',
    tags:         Array.isArray(fm.tags) ? fm.tags.map(String) : [],
    isPremium:    fm.isPremium === true,
    coverImage:   fm.coverImage != null ? String(fm.coverImage) : null,
    PreviewImage: mod.PreviewImage ?? null,
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

export async function getAllPosts() {
  return ALL_META;
}

export async function getRecentPosts(count) {
  return ALL_META.slice(0, count);
}

export async function getPostBySlug(slug) {
  const meta = ALL_META.find((p) => p.slug === slug);
  if (!meta) return null;

  const loaderEntry = Object.entries(lazyLoaders).find(
    ([filePath]) => slugFromPath(filePath) === slug
  );
  if (!loaderEntry) return null;

  const [, loader] = loaderEntry;
  const mod = await loader();

  return { ...meta, Component: mod.default };
}
