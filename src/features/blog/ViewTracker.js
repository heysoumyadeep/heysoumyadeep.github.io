/**
 * ViewTracker.js
 *
 * Tracks per-post view counts using localStorage.
 * All counts are stored under a single key "blog_views" as a JSON object
 * keyed by post slug: { [slug]: number }
 *
 * All localStorage access is wrapped in try/catch:
 *   - getViews returns 0 on any error
 *   - incrementView is a silent no-op on any error
 * If JSON.parse fails on the stored value, the entry is reset to {} and
 * processing continues.
 */

const STORAGE_KEY = 'blog_views';

/**
 * Read the current view store from localStorage.
 * Returns an empty object if the key is absent, unreadable, or unparseable.
 * @returns {{ [slug: string]: number }}
 */
function readStore() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) return {};
  try {
    const parsed = JSON.parse(raw);
    // Ensure the parsed value is a plain object; if not, treat as corrupt
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return {};
    }
    return parsed;
  } catch {
    // JSON.parse failed — reset to empty
    return {};
  }
}

/**
 * Write the view store back to localStorage.
 * @param {{ [slug: string]: number }} store
 */
function writeStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

/**
 * Return the current view count for the given slug.
 * Returns 0 if the slug has no recorded views or if localStorage is unavailable.
 * @param {string} slug
 * @returns {number}
 */
export function getViews(slug) {
  try {
    const store = readStore();
    const count = store[slug];
    return typeof count === 'number' ? count : 0;
  } catch {
    return 0;
  }
}

/**
 * Increment the view count for the given slug by 1.
 * If localStorage is unavailable or any error occurs, this is a silent no-op.
 * @param {string} slug
 */
export function incrementView(slug) {
  try {
    const store = readStore();
    const current = typeof store[slug] === 'number' ? store[slug] : 0;
    store[slug] = current + 1;
    writeStore(store);
  } catch {
    // Silent no-op on error
  }
}
