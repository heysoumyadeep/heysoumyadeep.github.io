import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@styles/global.css';

// rAF-throttled mouse tracker for cursor glow + parallax
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
