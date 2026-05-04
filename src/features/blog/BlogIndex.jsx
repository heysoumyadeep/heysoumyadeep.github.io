import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import SEO from '@/seo/SEO';
import { blogSchema, websiteSchema } from '@/seo/schemas';
import { getAllPosts } from './PostRepository.js';
import './BlogIndex.scss';

export default function BlogIndex() {
  const [posts, setPosts] = useState([]);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllPosts()
      .then(setPosts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return [...posts];
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q)
    );
  }, [posts, debouncedQuery]);

  return (
    <>
      <SEO
        title="Blog"
        description="Notes on engineering, software craft, and the occasional detour into other things I find interesting. Written by Soumyadeep Pradhan, Full-Stack Developer at JPMorgan Chase."
        canonical="/blog"
        schema={[websiteSchema, ...(posts.length ? [blogSchema(posts)] : [])]}
      />

      <main className="blog-page">
        <div className="container">
          <header className="blog-index__head reveal">
            <h1 className="blog-index__title">
              <span className="gradient-text">Blog</span>.
            </h1>
            <p className="blog-index__lede">
              Notes on engineering, software craft, and the occasional detour
              into other things I find interesting.
            </p>
            <div className="blog-index__search">
              <input
                type="search"
                placeholder="Search articles…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onInput={(e) => setQuery(e.target.value)}
                aria-label="Search articles"
              />
            </div>
          </header>

          {loading ? (
            <p className="blog-index__loading">Loading articles...</p>
          ) : filtered.length === 0 ? (
            <p className="blog-index__empty">
              {query ? `No articles match "${query}". Try a different search.` : 'No articles yet.'}
            </p>
          ) : (
            <ul className="blog-index__list">
              {filtered.map((post) => (
                <li key={post.slug}>
                  <Link to={`/blog/${post.slug}`} className={`blog-index__card${post.isPremium ? ' blog-index__card--premium' : ''}`}>
                    <div className="blog-index__meta mono">
                      <span>{post.date}</span>
                      <span aria-hidden="true">·</span>
                      <span>{post.readTime} read</span>
                      {post.isPremium && (
                        <span className="blog-index__premium-badge" aria-label="Premium article">
                          ☕ Premium
                        </span>
                      )}
                    </div>
                    <h2 className="blog-index__card-title">{post.title}</h2>
                    <p className="blog-index__card-excerpt">{post.excerpt}</p>
                    <span className="blog-index__card-cta" aria-hidden="true">
                      Read article →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </>
  );
}
