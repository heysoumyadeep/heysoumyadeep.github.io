import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './NavigationLoader.scss';

export default function NavigationLoader() {
  const location = useLocation();
  const [phase, setPhase] = useState('idle'); // idle → start → filling → complete
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
    setPhase('start');

    const raf = requestAnimationFrame(() => {
      setPhase('filling');

      timers.current.push(
        setTimeout(() => {
          setPhase('complete');
          timers.current.push(
            setTimeout(() => setPhase('idle'), 400)
          );
        }, 600)
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
