
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

// Register service worker
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('New content available. Reload?')) {
      updateSW();
    }
  },
  onOfflineReady() {
    console.log('App is ready for offline use');
  },
  immediate: true
});

// Add event listener to hide address bar on mobile
window.addEventListener('load', () => {
  // Attempt to hide the address bar on mobile
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  
  // Scroll to hide address bar - works on most mobile browsers
  window.scrollTo(0, 1);
  
  // Some mobile browsers need a timeout and a slightly higher value
  setTimeout(() => {
    window.scrollTo(0, 1);
  }, 100);
});

createRoot(document.getElementById("root")!).render(<App />);
