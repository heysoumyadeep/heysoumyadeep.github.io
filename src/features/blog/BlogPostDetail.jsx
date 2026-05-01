import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import SEO from '@/seo/SEO';
import { blogPostingSchema, breadcrumbSchema, websiteSchema, faqSchema } from '@/seo/schemas';
import { SITE_CONFIG } from '@config/site';
import { getPostBySlug } from './PostRepository.js';
import { getViews, incrementView } from './ViewTracker.js';
import PremiumGate from './PremiumGate.jsx';
import './BlogPostDetail.scss';

// ── Table of Contents ────────────────────────────────────────────────────────

function TableOfContents({ headings, onClose }) {
  if (!headings.length) return null;
  return (
    <nav className="blog-toc" aria-label="Table of contents">
      <div className="blog-toc__header">
        <span className="blog-toc__title">Contents</span>
        <button
          type="button"
          className="blog-toc__hide"
          onClick={onClose}
          aria-label="Hide table of contents"
        >
          Hide
        </button>
      </div>
      <ol className="blog-toc__list">
        {headings.map((h) => (
          <li key={h.id} className={`blog-toc__item blog-toc__item--h${h.level}`}>
            <a href={`#${h.id}`}>{h.text}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

// Extract h2/h3 headings from the rendered DOM after the MDX component mounts
function useHeadings(bodyRef) {
  const [headings, setHeadings] = useState([]);
  useEffect(() => {
    if (!bodyRef.current) return;
    const els = bodyRef.current.querySelectorAll('h2, h3');
    const items = Array.from(els).map((el, i) => {
      if (!el.id) el.id = `heading-${i}`;
      return { id: el.id, text: el.textContent, level: parseInt(el.tagName[1], 10) };
    });
    setHeadings(items);
  }, [bodyRef]);
  return headings;
}

// ── Feedback / suggestions form ──────────────────────────────────────────────

const MAX_FEEDBACK_LENGTH = 2000; // prevent localStorage abuse

function BlogFeedback({ slug, title }) {
  const [value, setValue] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sent

  const handleChange = (e) => {
    // Enforce max length client-side
    if (e.target.value.length <= MAX_FEEDBACK_LENGTH) {
      setValue(e.target.value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    // In production wire this to an API / Formspree / email service.
    // For now we store locally so the UX is complete.
    try {
      const key = 'blog_feedback';
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      // Cap stored entries to prevent unbounded localStorage growth
      const capped = existing.slice(-49); // keep last 49 + new one = 50 max
      capped.push({
        slug,
        title,
        message: trimmed.slice(0, MAX_FEEDBACK_LENGTH),
        ts: new Date().toISOString(),
      });
      localStorage.setItem(key, JSON.stringify(capped));
    } catch {
      // localStorage unavailable — still show success to user
    }
    setStatus('sent');
    setValue('');
  };

  return (
    <aside className="blog-feedback">
      <div className="blog-feedback__inner">
        <h3 className="blog-feedback__heading">
          Have a thought? Suggest something?
        </h3>
        <p className="blog-feedback__lede">
          Spotted something off, have a question, or want to add a point?
          Drop it here, I read every note.
        </p>

        {status === 'sent' ? (
          <div className="blog-feedback__thanks" role="status">
            <span>✓</span> Thanks, noted!
          </div>
        ) : (
          <form className="blog-feedback__form" onSubmit={handleSubmit}>
            <textarea
              className="blog-feedback__input"
              rows={4}
              placeholder="Any points to add? Corrections? Questions? Write freely…"
              value={value}
              onChange={handleChange}
              aria-label="Your feedback or suggestion"
              maxLength={MAX_FEEDBACK_LENGTH}
            />
            <div className="blog-feedback__actions">
              <button
                type="submit"
                className="blog-feedback__submit"
                disabled={!value.trim()}
              >
                Send feedback →
              </button>
              <span className="blog-feedback__hint">
                Or{' '}
                <a href="/#contact" className="blog-feedback__contact-link">
                  contact me directly
                </a>
              </span>
              {value.length > MAX_FEEDBACK_LENGTH * 0.8 && (
                <span className="blog-feedback__char-count">
                  {value.length}/{MAX_FEEDBACK_LENGTH}
                </span>
              )}
            </div>
          </form>
        )}
      </div>
    </aside>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function BlogPostDetail({ slug }) {
  const [post, setPost] = useState(null);
  const [views, setViews] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [tocVisible, setTocVisible] = useState(true);
  const bodyRef = useRef(null);
  const headings = useHeadings(bodyRef);

  // Guard against StrictMode double-invoke and fast navigation
  const viewTrackedRef = useRef(false);

  useEffect(() => {
    viewTrackedRef.current = false; // reset on slug change
    getPostBySlug(slug)
      .then((p) => {
        setPost(p);
        if (p && !viewTrackedRef.current) {
          viewTrackedRef.current = true;
          incrementView(slug);
          setViews(getViews(slug));
        }
      })
      .catch(console.error);
  }, [slug]);

  const isoDate = post?.date ? new Date(post.date).toISOString() : undefined;

  return (
    <>
      {post && (
        <SEO
          title={post.title}
          description={post.excerpt}
          canonical={`/blog/${slug}`}
          imageAlt={`${post.title} - ${post.author}`}
          type="article"
          article={{ publishedTime: isoDate, author: post.author, tags: post.tags }}
          schema={[
            websiteSchema,
            blogPostingSchema(post),
            breadcrumbSchema([
              { name: 'Home', url: SITE_CONFIG.url },
              { name: 'Blog', url: `${SITE_CONFIG.url}/blog` },
              { name: post.title, url: `${SITE_CONFIG.url}/blog/${slug}` },
            ]),
            ...(post.faqs?.length ? [faqSchema(post.faqs)] : []),
          ]}
        />
      )}

      <main className="blog-page">
        <div className={`blog-post-wrap container${expanded ? ' blog-post-wrap--expanded' : ''}`}>
          <article className="blog-post">

            {/* Top bar: back link + expand toggle */}
            <div className="blog-post__topbar">
              <Link to="/blog" className="blog-post__back">
                ← Back to all articles
              </Link>
              <button
                type="button"
                className="blog-post__expand-btn"
                onClick={() => setExpanded((v) => !v)}
                aria-label={expanded ? 'Collapse to reading width' : 'Expand to full width'}
                title={expanded ? 'Collapse' : 'Expand width'}
              >
                {expanded ? '⟵ Collapse' : '⟷ Expand'}
              </button>
            </div>

            {post ? (
              <>
                <div className="blog-post__meta mono">
                  <time dateTime={isoDate}>{post.date}</time>
                  <span aria-hidden="true">·</span>
                  <span>{post.readTime} read</span>
                  <span aria-hidden="true">·</span>
                  <span>{views} views</span>
                </div>

                <h1 className="blog-post__title">{post.title}</h1>

                <address className="blog-post__byline">
                  By <a rel="author" href={SITE_CONFIG.url}>{post.author}</a>
                </address>

                <p className="blog-post__excerpt">{post.excerpt}</p>

                {post.tags?.length > 0 && (
                  <ul className="blog-post__tags" aria-label="Post tags">
                    {post.tags.map((tag) => (
                      <li key={tag} className="blog-post__tag"><span>{tag}</span></li>
                    ))}
                  </ul>
                )}

                {/* Table of contents — shown when headings exist */}
                {tocVisible && headings.length > 0 && (
                  <TableOfContents
                    headings={headings}
                    onClose={() => setTocVisible(false)}
                  />
                )}
                {!tocVisible && headings.length > 0 && (
                  <button
                    type="button"
                    className="blog-toc__show"
                    onClick={() => setTocVisible(true)}
                  >
                    Show contents
                  </button>
                )}

                <div className="blog-post__body" ref={bodyRef}>
                  {post.Component && (
                    post.isPremium
                      ? (
                        <PremiumGate slug={slug}>
                          <post.Component />
                        </PremiumGate>
                      )
                      : <post.Component />
                  )}
                </div>
              </>
            ) : (
              <div className="blog-post__missing">
                <h1>Post not found</h1>
                <p>That article doesn&rsquo;t exist, or hasn&rsquo;t been written yet.</p>
              </div>
            )}

            {/* Feedback section — always shown at the bottom */}
            {post && <BlogFeedback slug={slug} title={post.title} />}
          </article>
        </div>
      </main>
    </>
  );
}
