/**
 * PostProcessor.js
 *
 * Builds a BlogPost object from an eagerly-imported MDX module.
 * Each MDX file exports:
 *   - `frontmatter` — a plain JS object with title, date, readTime, excerpt, author, tags
 *   - `default`     — a React component rendering the post body
 */

/**
 * Derive a slug from a file path like "../../data/blog/posts/my-post.mdx" → "my-post"
 * @param {string} filePath
 * @returns {string}
 */
export function slugFromPath(filePath) {
  return filePath.split('/').pop().replace(/\.mdx$/, '');
}

/**
 * Build a BlogPost object from an MDX module and its file path.
 *
 * @param {object} mod      - The eagerly-imported MDX module
 * @param {string} filePath - The glob key (file path string)
 * @returns {BlogPost}
 */
export function buildPost(mod, filePath) {
  const slug = slugFromPath(filePath);
  const fm = mod.frontmatter ?? {};

  return {
    slug,
    title: fm.title ?? '',
    date: fm.date != null ? String(fm.date) : '',
    readTime: fm.readTime != null ? String(fm.readTime) : '',
    excerpt: fm.excerpt != null ? String(fm.excerpt) : '',
    author: fm.author != null ? String(fm.author) : '',
    tags: Array.isArray(fm.tags) ? fm.tags.map(String) : [],
    Component: mod.default,
    faqs: Array.isArray(mod.faqs) ? mod.faqs : [],
  };
}
