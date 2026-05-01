/**
 * SupportSnackbar.jsx
 *
 * Custom snackbar that triggers the BMC widget when clicked.
 * Only appears on homepage and blog detail pages when user scrolls near contact/feedback section.
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './SupportSnackbar.scss';

const SHOW_DELAY_MS = 500;

export default function SupportSnackbar() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const location = useLocation();

  // Reset dismissed state on route change
  useEffect(() => {
    setDismissed(false);
    setVisible(false);
  }, [location.pathname]);

  // Hide BMC widget button initially and keep it hidden
  useEffect(() => {
    const hideWidget = () => {
      const widget = document.getElementById('bmc-wbtn');
      if (widget) {
        widget.style.display = 'none';
      }
    };

    // Hide immediately
    hideWidget();

    // Keep checking and hiding (in case widget loads late)
    const interval = setInterval(hideWidget, 100);
    const timeout = setTimeout(() => clearInterval(interval), 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (dismissed) return;

    // Only show on homepage (/) or blog detail pages (/blog/:slug)
    const isHomePage = location.pathname === '/';
    const isBlogDetailPage = /^\/blog\/[^/]+$/.test(location.pathname);
    
    if (!isHomePage && !isBlogDetailPage) {
      setVisible(false);
      return;
    }

    // Reset visibility on route change
    setVisible(false);

    let timer = null;
    let triggered = false;

    const onScroll = () => {
      if (triggered) return;

      let targetSection = null;
      
      if (isHomePage) {
        targetSection = document.getElementById('contact');
      } else if (isBlogDetailPage) {
        targetSection = document.querySelector('.blog-feedback');
      }

      if (targetSection) {
        const rect = targetSection.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // Only show when target section enters viewport
        if (rect.top <= windowHeight && rect.bottom >= 0) {
          triggered = true;
          window.removeEventListener('scroll', onScroll);
          timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
        }
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    
    // DON'T check immediately - only on scroll
    
    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(timer);
    };
  }, [dismissed, location.pathname]);

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
  };

  const handleSupport = () => {
    // Trigger the BMC widget button click
    const bmcButton = document.querySelector('#bmc-wbtn');
    if (bmcButton) {
      bmcButton.click();
    }
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

      <button
        type="button"
        className="support-snackbar__cta"
        onClick={handleSupport}
        aria-label="Buy me a coffee"
      >
        <img 
          src="https://cdn.buymeacoffee.com/buttons/bmc-new-btn-logo.svg" 
          alt="Buy me a coffee"
          className="support-snackbar__bmc-logo"
        />
      </button>

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
