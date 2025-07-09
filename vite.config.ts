
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
      includeAssets: ['favicon.ico', 'lovable-uploads/bb4f6fc5-d4db-4a3f-b0b3-761e8ae92496.png', 'lovable-uploads/ab4577a6-1058-4fc8-a788-477b08e1f957.png'],
      manifest: {
        name: 'ShuttleSession',
        short_name: 'ShuttleSession',
        description: 'Create games, manage player queues and keep your badminton sessions running smoothly.',
        theme_color: '#00702A',
        background_color: '#00702A',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        categories: ['sports', 'utilities'],
        icons: [
          {
            src: '/lovable-uploads/bb4f6fc5-d4db-4a3f-b0b3-761e8ae92496.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/lovable-uploads/ab4577a6-1058-4fc8-a788-477b08e1f957.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/lovable-uploads/bb4f6fc5-d4db-4a3f-b0b3-761e8ae92496.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/lovable-uploads/ab4577a6-1058-4fc8-a788-477b08e1f957.png',
            sizes: '512x512',
            type: 'image/png'
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
