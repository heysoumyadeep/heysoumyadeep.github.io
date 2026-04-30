import { useEffect, useRef } from 'react';
import './ParallaxBackground.scss';

export default function ParallaxBackground() {
  const ref = useRef(null);
  const stateRef = useRef({ x: 0, y: 0, scroll: 0 });
  const rafRef = useRef(0);

  useEffect(() => {
    const update = () => {
      if (!ref.current) return;
      const { x, y, scroll } = stateRef.current;
      ref.current.querySelectorAll('[data-speed]').forEach((el) => {
        const speed = parseFloat(el.dataset.speed);
        const mouse = parseFloat(el.dataset.mouse || '0');
        el.style.transform = `translate3d(${x * mouse}px, ${y * mouse + scroll * speed}px, 0)`;
      });
    };

    const onScroll = () => {
      stateRef.current.scroll = window.scrollY;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(update);
    };

    const onMouseMove = (e) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      stateRef.current.x = (e.clientX - cx) / cx;
      stateRef.current.y = (e.clientY - cy) / cy;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('mousemove', onMouseMove);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="parallax" ref={ref} aria-hidden="true">
      <div className="parallax__orb parallax__orb--1" data-speed="0.25" data-mouse="40" />
      <div className="parallax__orb parallax__orb--2" data-speed="0.4" data-mouse="-30" />
      <div className="parallax__orb parallax__orb--3" data-speed="0.15" data-mouse="20" />
      <div className="parallax__orb parallax__orb--4" data-speed="0.3" data-mouse="-50" />
      <div className="parallax__orb parallax__orb--5" data-speed="0.2" data-mouse="35" />
      <div className="parallax__grid" data-speed="0.05" data-mouse="0" />
    </div>
  );
}
