
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from 'vite-plugin-pwa';
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/], // Only exclude API routes, allow app routes
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
              }
            }
          }
        ]
      },
      includeAssets: ['favicon.ico', 'lovable-uploads/357ffd0e-0828-4660-96df-166a9769a250.png', 'lovable-uploads/55cb3b3b-e914-4a52-861a-cd69e1ec3f02.png'],
      manifest: {
        name: 'ShuttleSession',
        short_name: 'ShuttleSession',
        description: 'Create games, manage player queues and keep your badminton sessions running smoothly.',
        theme_color: '#00702A',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        categories: ['sports', 'utilities'],
        icons: [
          {
            src: '/lovable-uploads/55cb3b3b-e914-4a52-861a-cd69e1ec3f02.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/lovable-uploads/55cb3b3b-e914-4a52-861a-cd69e1ec3f02.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/lovable-uploads/55cb3b3b-e914-4a52-861a-cd69e1ec3f02.png',
            sizes: '180x180',
            type: 'image/png',
            purpose: 'apple-touch-icon'
          }
        ]
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
