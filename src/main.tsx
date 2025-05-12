
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

// Optimize the address bar hiding function for mobile
const hideAddressBar = () => {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  
  // More reliable method to hide address bar
  if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
    // Only try fullscreen on user interaction (needed for most browsers)
    document.addEventListener('click', () => {
      document.documentElement.requestFullscreen().catch(err => {
        // Fallback to traditional scroll method
        window.scrollTo(0, 1);
      });
    }, { once: true });
  } else {
    // Fallback for browsers that don't support fullscreen
    window.scrollTo(0, 1);
    setTimeout(() => window.scrollTo(0, 1), 150);
  }
};

// Add event listener to hide address bar on mobile
window.addEventListener('load', hideAddressBar);
window.addEventListener('resize', hideAddressBar);

createRoot(document.getElementById("root")!).render(<App />);
