import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

console.log('App starting...');

const container = document.getElementById('root');

if (!container) {
  console.error('Root container not found');
} else {
  const root = createRoot(container);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  console.log('App rendered');
}

// Service Worker Registration with Auto-Update
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        console.log('SW Registered');

        // Detect updates
        reg.onupdatefound = () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.onstatechange = () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('New content available, refreshing...');
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
              }
            };
          }
        };

        // Periodic check for updates
        setInterval(() => {
          reg.update();
        }, 60 * 1000); // Every minute
      })
      .catch(err => console.error('SW registration failed:', err));

    // Refresh all tabs when the new service worker takes over
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        window.location.reload();
        refreshing = true;
      }
    });
  });
}
