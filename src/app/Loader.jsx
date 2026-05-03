/**
 * Loader.jsx
 *
 * Full-screen loading state shown while lazy page chunks are fetching.
 * Uses the site logo (S mark) with a pulsing glow animation matching
 * the site's crimson/coral accent palette.
 */

import { useEffect } from 'react';
import './Loader.scss';

export default function Loader() {
  // Hide the BMC widget while the loader is showing
  useEffect(() => {
    const hide = () => {
      const btn = document.getElementById('bmc-wbtn');
      if (btn) btn.style.setProperty('display', 'none', 'important');
    };
    hide();
    // Poll briefly in case the widget loads after us
    const interval = setInterval(hide, 100);
    const timeout = setTimeout(() => clearInterval(interval), 3000);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      // Restore when loader unmounts (page has loaded)
      const btn = document.getElementById('bmc-wbtn');
      if (btn) btn.style.removeProperty('display');
    };
  }, []);
  return (
    <div className="loader" aria-label="Loading" role="status">
      {/* Aurora background orbs */}
      <div className="loader__aurora loader__aurora--1" />
      <div className="loader__aurora loader__aurora--2" />
      <div className="loader__aurora loader__aurora--3" />

      {/* Glow bloom behind the logo */}
      <div className="loader__glow" />

      {/* Logo mark */}
      <div className="loader__mark">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          width="72"
          height="72"
          aria-hidden="true"
        >
          <rect width="32" height="32" rx="8" fill="#C72C41" />
          <text
            x="16"
            y="22"
            fontFamily="Poppins, sans-serif"
            fontSize="18"
            fontWeight="700"
            fill="#2D142C"
            textAnchor="middle"
          >
            S
          </text>
        </svg>
      </div>
    </div>
  );
}
