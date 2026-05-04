import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Adds `is-visible` to `.reveal` elements as they scroll into view.
 *
 * Re-runs on every route change so elements rendered after navigation
 * are picked up correctly. Uses a single shared IntersectionObserver
 * per activation — disconnected on cleanup.
 */
export function useScrollReveal() {
  const location = useLocation();

  useEffect(() => {
    // Create observer upfront so cleanup always has a reference to disconnect
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    // Small delay lets React finish painting the new route's DOM
    const id = requestAnimationFrame(() => {
      const targets = document.querySelectorAll('.reveal:not(.is-visible)');
      targets.forEach((el) => observer.observe(el));
    });

    // Cleanup always runs — cancels rAF if pending, disconnects observer
    return () => {
      cancelAnimationFrame(id);
      observer.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);
}
