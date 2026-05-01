/**
 * SupportSnackbar.jsx
 *
 * Scroll-triggered snackbar in the bottom-right corner.
 * Only appears on homepage and blog detail pages when user scrolls near contact/feedback section.
 * Dismissed state is stored in sessionStorage (once per session).
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './SupportSnackbar.scss';

const BMC_URL = 'https://buymeacoffee.com/heysoumyadeep';
const STORAGE_KEY = 'portfolio:bmc_snackbar_dismissed';
const SHOW_DELAY_MS = 500;

export default function SupportSnackbar() {
  const [visible,   setVisible]   = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    try { return !!sessionStorage.getItem(STORAGE_KEY); } catch { return false; }
  });
  const location = useLocation();

  useEffect(() => {
    if (dismissed) return;

    // Only show on homepage (/) or blog detail pages (/blog/:slug)
    const isHomePage = location.pathname === '/';
    const isBlogDetailPage = /^\/blog\/[^/]+$/.test(location.pathname);
    
    if (!isHomePage && !isBlogDetailPage) {
      setVisible(false);
      return;
    }

    let timer = null;
    let triggered = false;

    const onScroll = () => {
      if (triggered) return;

      let targetSection = null;
      
      if (isHomePage) {
        // Homepage: trigger when #contact section becomes visible
        targetSection = document.getElementById('contact');
      } else if (isBlogDetailPage) {
        // Blog detail: trigger when .blog-feedback section becomes visible
        targetSection = document.querySelector('.blog-feedback');
      }

      if (targetSection) {
        const rect = targetSection.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // Show when target section enters viewport (top edge visible)
        if (rect.top <= windowHeight && rect.bottom >= 0) {
          triggered = true;
          window.removeEventListener('scroll', onScroll);
          timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
        }
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    // Check immediately in case already scrolled to the section
    onScroll();
    
    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(timer);
    };
  }, [dismissed, location.pathname]);

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
    try { sessionStorage.setItem(STORAGE_KEY, '1'); } catch { /* ignore */ }
  };

  if (dismissed) return null;

  return (
    <div
      className={`support-snackbar${visible ? ' support-snackbar--visible' : ''}`}
      role="complementary"
      aria-label="Support the author"
    >
      <span className="support-snackbar__icon" aria-hidden="true">☕</span>

      <div className="support-snackbar__body">
        <p className="support-snackbar__text">Liked my work?</p>
        <p className="support-snackbar__sub">Support me with a coffee.</p>
      </div>

      <a
        href={BMC_URL}
        target="_blank"
        rel="noreferrer noopener"
        className="support-snackbar__cta"
        onClick={handleDismiss}
      >
        Support me
      </a>

      <button
        type="button"
        className="support-snackbar__close"
        onClick={handleDismiss}
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}
