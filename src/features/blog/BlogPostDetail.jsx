import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import SEO from '@/seo/SEO';
import { blogPostingSchema, breadcrumbSchema, websiteSchema } from '@/seo/schemas';
import { SITE_CONFIG } from '@config/site';
import { personalInfo } from '@data';
import { getPostBySlug } from './PostRepository.js';
import { incrementView } from './ViewTracker.js';
import PremiumGate from './PremiumGate.jsx';
import './BlogPostDetail.scss';

// ── Feedback / suggestions form ──────────────────────────────────────────────

const MAX_FEEDBACK_LENGTH = 2000;

function BlogFeedback({ slug, title }) {
  const [email, setEmail]   = useState('');
  const [value, setValue]   = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;

    // Validate email only if provided (it's optional)
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailErr('Enter a valid email address.');
      return;
    }
    setEmailErr('');
    setStatus('sending');

    try {
      // If reader left an email, send them the thank-you email too
      if (email.trim()) {
        await emailjs.send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID,
          import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
          {
            to_email: email.trim(),
            message:  `[Blog feedback on "${title}"]\n\n${trimmed}`,
          },
          import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
        );
      } else {
        // No email — still notify you via a second template or the same one
        // sent to yourself so you don't miss anonymous feedback
        await emailjs.send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID,
          import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
          {
            to_email: 'contact@soumya.io',
            message:  `[Anonymous blog feedback on "${title}"]\n\n${trimmed}`,
          },
          import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
        );
      }

      // Also persist locally as a backup
      try {
        const key = 'blog_feedback';
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        const capped = existing.slice(-49);
        capped.push({ slug, title, message: trimmed.slice(0, MAX_FEEDBACK_LENGTH), ts: new Date().toISOString() });
        localStorage.setItem(key, JSON.stringify(capped));
      } catch { /* localStorage unavailable */ }

      setStatus('sent');
      setValue('');
      setEmail('');
    } catch {
      setStatus('error');
    }
  };

  return (
    <aside className="blog-feedback">
      <div className="blog-feedback__inner">
        <h3 className="blog-feedback__heading">
          Have a thought? Suggest something?
        </h3>
        <p className="blog-feedback__lede">
          Spotted something off, have a question, or want to add a point?
          Drop it here - I read every note.
        </p>

        {status === 'sent' ? (
          <div className="blog-feedback__thanks" role="status">
            <span>✓</span> Thanks, noted! I'll get back to you if you left an email.
          </div>
        ) : (
          <form className="blog-feedback__form" onSubmit={handleSubmit}>
            {/* Optional email field */}
            <div className="blog-feedback__field">
              <input
                type="email"
                className={`blog-feedback__email-input${emailErr ? ' has-error' : ''}`}
                placeholder="Your email (optional - if you'd like a reply)"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailErr(''); }}
                aria-label="Your email address (optional)"
                autoComplete="email"
              />
              {emailErr && (
                <span className="blog-feedback__error" role="alert">{emailErr}</span>
              )}
            </div>

            <textarea
              className="blog-feedback__input"
              rows={4}
              placeholder="Any points to add? Corrections? Questions? Write freely…"
              value={value}
              onChange={(e) => { if (e.target.value.length <= MAX_FEEDBACK_LENGTH) setValue(e.target.value); }}
              aria-label="Your feedback or suggestion"
              maxLength={MAX_FEEDBACK_LENGTH}
            />

            <div className="blog-feedback__actions">
              <button
                type="submit"
                className="blog-feedback__submit"
                disabled={!value.trim() || status === 'sending'}
              >
                {status === 'sending' ? 'Sending…' : 'Send feedback →'}
              </button>
              <span className="blog-feedback__hint">
                Or{' '}
                <a href={`mailto:${personalInfo.email}`} className="blog-feedback__contact-link">
                  contact me directly
                </a>
              </span>
              {value.length > MAX_FEEDBACK_LENGTH * 0.8 && (
                <span className="blog-feedback__char-count">
                  {value.length}/{MAX_FEEDBACK_LENGTH}
                </span>
              )}
            </div>

            {status === 'error' && (
              <p className="blog-feedback__error" role="alert">
                Something went wrong. Please try again.
              </p>
            )}
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
  const bodyRef = useRef(null);

  // Guard against StrictMode double-invoke and fast navigation
  const viewTrackedRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    viewTrackedRef.current = false; // reset on slug change

    getPostBySlug(slug)
      .then(async (p) => {
        if (!mounted) return;
        setPost(p);
        if (p && !viewTrackedRef.current) {
          viewTrackedRef.current = true;
          const newCount = await incrementView(slug);
          if (mounted) setViews(newCount);
        }
      })
      .catch(console.error);

    return () => { mounted = false; };
  }, [slug]);

  const isoDate = post?.date ? new Date(post.date).toISOString() : undefined;

  return (
    <>
      {post && (
        <SEO
          title={post.title}
          description={post.excerpt}
          canonical={`/blog/${slug}`}
          image={`${SITE_CONFIG.url}/og-images/${slug}.png`}
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

                <div className="blog-post__body" ref={bodyRef}>
                  {post.Component && (
                    post.isPremium
                      ? (
                        <PremiumGate slug={slug} tags={post.tags}>
                          <post.Component />
                        </PremiumGate>
                      )
                      : <post.Component />
                  )}
                </div>
              </>
            ) : (
              <div className="blog-post__missing">
                <p className="blog-post__missing-code mono">404</p>
                <h1 className="blog-post__missing-title">No blog at this URL.</h1>
                <p className="blog-post__missing-lede">
                  That post doesn't exist. It may have been moved or the URL is off.
                </p>
                <Link to="/blog" className="blog-post__missing-btn">
                  Browse all articles →
                </Link>
              </div>
            )}

            {/* Tags - shown after body for non-premium posts only; premium posts show tags after unlock */}
            {post?.tags?.length > 0 && !post.isPremium && (
              <div className="blog-post__tags-footer">
                <span className="blog-post__tags-label">Tags used here:</span>
                <ul className="blog-post__tags" aria-label="Post tags">
                  {post.tags.map((tag) => (
                    <li key={tag} className="blog-post__tag"><span>{tag}</span></li>
                  ))}
                </ul>
              </div>
            )}

            {/* Feedback section - always shown at the bottom */}
            {post && <BlogFeedback slug={slug} title={post.title} />}
          </article>
        </div>
      </main>
    </>
  );
}
