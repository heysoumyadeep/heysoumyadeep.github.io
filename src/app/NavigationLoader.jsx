/**
 * NavigationLoader.jsx
 *
 * Shows a slim progress bar at the top of the page during React Router
 * navigations (when chunks are already cached and Suspense won't fire).
 * Content remains fully visible — only the bar appears above the navbar.
 */

import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './NavigationLoader.scss';

export default function NavigationLoader() {
  const location = useLocation();
  // 'idle' → 'start' → 'filling' → 'complete' → 'idle'
  const [phase, setPhase] = useState('idle');
  const prevPath = useRef(location.pathname);
  const timers = useRef([]);

  const clearTimers = () => {
    timers.current.forEach(id => clearTimeout(id));
    timers.current = [];
  };

  useEffect(() => {
    if (location.pathname === prevPath.current) return;
    prevPath.current = location.pathname;

    clearTimers();

    // Phase 1: mount the bar at width 0 (no transition yet)
    setPhase('start');

    // Phase 2: one rAF later, trigger the fill transition (0 → 85%)
    const raf = requestAnimationFrame(() => {
      setPhase('filling');

      // Phase 3: after the page has painted, snap to 100% and fade out
      timers.current.push(
        setTimeout(() => {
          setPhase('complete');

          // Phase 4: remove from DOM after fade finishes
          timers.current.push(
            setTimeout(() => setPhase('idle'), 400)
          );
        }, 420) // slightly longer than the fill transition
      );
    });

    return () => {
      cancelAnimationFrame(raf);
      clearTimers();
    };
  }, [location.pathname]);

  if (phase === 'idle') return null;

  return (
    <div
      className={`nav-progress nav-progress--${phase}`}
      role="progressbar"
      aria-label="Page loading"
      aria-valuemin={0}
      aria-valuemax={100}
    />
  );
}
