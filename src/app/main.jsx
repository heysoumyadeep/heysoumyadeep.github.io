import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@styles/global.css';

// Single rAF-throttled mousemove listener shared by:
//   1. Cursor glow (CSS custom properties --mouse-x / --mouse-y)
//   2. ParallaxBackground (reads the same event via its own listener)
// Throttling prevents layout thrashing on high-frequency pointer events.
let rafPending = false;
document.addEventListener('mousemove', (e) => {
  if (rafPending) return;
  rafPending = true;
  requestAnimationFrame(() => {
    document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
    document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    rafPending = false;
  });
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
