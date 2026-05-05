/**
 * SSG render entry — used only at build time by vite-plugin-ssg.js
 * Never imported by the browser bundle.
 *
 * Exports a single renderPost(slug, mod) function that returns an HTML string
 * of the article body. We keep this intentionally minimal — no Router, no
 * Helmet, no theme context — because we only need the raw article content
 * injected into the static shell. All interactive wrappers hydrate normally
 * on the client.
 */

import { renderToString } from 'react-dom/server';

/**
 * Render the MDX component for a post to an HTML string.
 *
 * @param {object} mod   - The resolved MDX module (mod.default = Component, mod.frontmatter)
 * @param {object} meta  - { slug, title, date, readTime, excerpt, author, tags }
 * @returns {string}     - Static HTML string of the article body
 */
export function renderPost(mod, meta) {
  const Component = mod.default;
  if (!Component) return '';

  const isoDate = meta.date ? new Date(meta.date).toISOString() : '';

  const element = (
    <article className="blog-post" data-ssg="true">
      <div className="blog-post__meta mono">
        {isoDate && <time dateTime={isoDate}>{meta.date}</time>}
        {meta.readTime && <><span aria-hidden="true">·</span><span>{meta.readTime} read</span></>}
      </div>

      <h1 className="blog-post__title">{meta.title}</h1>

      {meta.author && (
        <address className="blog-post__byline">
          By <a rel="author" href="https://soumya.io">{meta.author}</a>
        </address>
      )}

      {meta.excerpt && (
        <p className="blog-post__excerpt">{meta.excerpt}</p>
      )}

      <div className="blog-post__body">
        <Component />
      </div>

      {meta.tags?.length > 0 && (
        <div className="blog-post__tags-footer">
          <span className="blog-post__tags-label">TAGS</span>
          <ul className="blog-post__tags" aria-label="Post tags">
            {meta.tags.map((tag) => (
              <li key={tag} className="blog-post__tag">{tag}</li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );

  try {
    return renderToString(element);
  } catch (err) {
    // If renderToString fails (e.g. SVG/browser-only APIs), return empty string
    // so the build doesn't break — the client will hydrate normally
    console.warn(`[ssg] renderToString failed for "${meta.slug}":`, err.message);
    return '';
  }
}
