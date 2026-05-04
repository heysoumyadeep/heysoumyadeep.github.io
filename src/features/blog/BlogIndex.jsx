import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SEO from '@/seo/SEO';
import { blogSchema, websiteSchema } from '@/seo/schemas';
import { getAllPosts } from './PostRepository.js';
import './BlogIndex.scss';

// Gradient colors for preview cards (fallback if no image)
const GRADIENT_COLORS = [
  'linear-gradient(135deg, #801336 0%, #ee4540 100%)',
  'linear-gradient(135deg, #510a32 0%, #9333ea 100%)',
  'linear-gradient(135deg, #78350f 0%, #f59e0b 100%)',
  'linear-gradient(135deg, #064e3b 0%, #10b981 100%)',
  'linear-gradient(135deg, #7f1d1d 0%, #ef4444 100%)',
];

export default function BlogIndex() {
  const [posts, setPosts] = useState([]);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllPosts()
      .then(setPosts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showDropdown && !e.target.closest('.blog-index__filter')) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showDropdown]);

  // Get unique categories from all posts
  const categories = useMemo(() => {
    const allTags = posts.flatMap(p => p.tags || []);
    const unique = ['All', ...new Set(allTags)];
    return unique;
  }, [posts]);

  // Show first 3 categories as pills, rest in dropdown
  const visibleCategories = categories.slice(0, 4);
  const dropdownCategories = categories.slice(4);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = [...posts];
    
    // Filter by category
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.tags?.includes(selectedCategory));
    }
    
    // Filter by search query
    if (q) {
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q)
      );
    }
    
    return result;
  }, [posts, selectedCategory, query]);

  const featuredPost = filtered[0];
  const otherPosts = filtered.slice(1);

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

            <div className="blog-index__controls">
              <div className="blog-index__search">
                <svg className="blog-index__search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  type="search"
                  placeholder={`Search ${posts.length} articles...`}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Search articles"
                />
              </div>

              <div className="blog-index__categories">
                {visibleCategories.map((cat) => (
                  <button
                    key={cat}
                    className={`blog-index__category-btn${selectedCategory === cat ? ' active' : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}

                {dropdownCategories.length > 0 && (
                  <div className="blog-index__filter">
                    <button
                      className={`blog-index__filter-btn${dropdownCategories.includes(selectedCategory) ? ' active' : ''}`}
                      onClick={() => setShowDropdown(!showDropdown)}
                      aria-label="Show more categories"
                    >
                      {dropdownCategories.includes(selectedCategory) ? selectedCategory : 'Show more'}
                      <svg 
                        width="12" 
                        height="8" 
                        viewBox="0 0 12 8" 
                        fill="none"
                        style={{ 
                          transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s ease'
                        }}
                      >
                        <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>

                    {showDropdown && (
                      <div className="blog-index__dropdown">
                        {dropdownCategories.map((cat) => (
                          <button
                            key={cat}
                            className={`blog-index__dropdown-item${selectedCategory === cat ? ' active' : ''}`}
                            onClick={() => {
                              setSelectedCategory(cat);
                              setShowDropdown(false);
                            }}
                          >
                            {cat}
                            {selectedCategory === cat && (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {selectedCategory !== 'All' && (
                  <button
                    className="blog-index__clear-btn"
                    onClick={() => setSelectedCategory('All')}
                    aria-label="Clear filters"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          </header>

          {loading ? (
            <p className="blog-index__loading">Loading articles...</p>
          ) : filtered.length === 0 ? (
            <p className="blog-index__empty">
              {query ? `No articles match "${query}". Try a different search.` : 'No articles yet.'}
            </p>
          ) : (
            <>
              {/* Featured Post */}
              {featuredPost && (
                <Link to={`/blog/${featuredPost.slug}`} className="blog-index__featured">
                  <div className="blog-index__featured-preview">
                    {featuredPost.PreviewImage
                      ? <featuredPost.PreviewImage />
                      : <div className="blog-index__preview-fallback" style={{ background: GRADIENT_COLORS[0] }} />
                    }
                    <span className="blog-index__featured-label">
                      ARTICLE PREVIEW
                      {featuredPost.tags?.[0] && ` · ${featuredPost.tags[0].toUpperCase()}`}
                    </span>
                    {featuredPost.isPremium && (
                      <span className="blog-index__premium-badge" aria-label="Premium article">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M12 1C8.676 1 6 3.676 6 7v1H4a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h-2V7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4v1H8V7c0-2.276 1.724-4 4-4zm0 9a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"/>
                        </svg>
                        Premium
                      </span>
                    )}
                  </div>
                  <div className="blog-index__featured-content">
                    <h2 className="blog-index__featured-title">{featuredPost.title}</h2>
                    <p className="blog-index__featured-excerpt">{featuredPost.excerpt}</p>
                    <div className="blog-index__featured-meta mono">
                      <span>{featuredPost.date}</span>
                      <span aria-hidden="true">·</span>
                      <span>{featuredPost.readTime} read</span>
                    </div>
                    <button className="blog-index__featured-btn">
                      Read article →
                    </button>
                  </div>
                </Link>
              )}

              {/* Other Posts Grid */}
              {otherPosts.length > 0 && (
                <ul className="blog-index__grid">
                  {otherPosts.map((post, index) => (
                    <li key={post.slug}>
                      <Link to={`/blog/${post.slug}`} className="blog-index__card">
                        <div className="blog-index__card-preview">
                          {post.PreviewImage
                            ? <post.PreviewImage />
                            : <div className="blog-index__preview-fallback" style={{ background: GRADIENT_COLORS[(index + 1) % GRADIENT_COLORS.length] }} />
                          }
                          {post.isPremium && (
                            <span className="blog-index__premium-badge" aria-label="Premium article">
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                <path d="M12 1C8.676 1 6 3.676 6 7v1H4a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h-2V7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4v1H8V7c0-2.276 1.724-4 4-4zm0 9a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"/>
                              </svg>
                              Premium
                            </span>
                          )}
                        </div>
                        <div className="blog-index__card-content">
                          <div className="blog-index__card-meta mono">
                            <span>{post.date}</span>
                            <span aria-hidden="true">·</span>
                            <span>{post.readTime} read</span>
                            {post.tags?.[0] && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span>{post.tags[0]}</span>
                              </>
                            )}
                          </div>
                          <h3 className="blog-index__card-title">{post.title}</h3>
                          <p className="blog-index__card-excerpt">{post.excerpt}</p>
                          <span className="blog-index__card-cta">
                            Read article →
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}
