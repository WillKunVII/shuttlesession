
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

// Register service worker with improved error handling
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('New content available. Reload?')) {
      updateSW();
    }
  },
  onOfflineReady() {
    console.log('App is ready for offline use');
  },
  onRegisterError(error) {
    console.error('Service worker registration failed:', error);
  },
  immediate: true
});

// Check if the app is running as an installed PWA
const isPWA = () => {
  return window.matchMedia('(display-mode: standalone)').matches || 
         window.matchMedia('(display-mode: fullscreen)').matches || 
         window.navigator.standalone === true;
};

// Optimize the address bar hiding function for mobile PWAs only
const hideAddressBar = () => {
  // Only proceed if this is a PWA
  if (!isPWA()) return;
  
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  
  // Try to hide address bar on mobile
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

// Add event listener to hide address bar on mobile (only for PWAs)
window.addEventListener('load', hideAddressBar);
window.addEventListener('resize', hideAddressBar);

createRoot(document.getElementById("root")!).render(<App />);
