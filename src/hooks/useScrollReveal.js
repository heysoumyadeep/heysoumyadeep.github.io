import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Adds `is-visible` to `.reveal` elements as they scroll into view
export function useScrollReveal() {  const location = useLocation();

  useEffect(() => {
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

    // Wait for React to finish painting
    const id = requestAnimationFrame(() => {
      document.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => observer.observe(el));
    });

    return () => {
      cancelAnimationFrame(id);
      observer.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);
}
