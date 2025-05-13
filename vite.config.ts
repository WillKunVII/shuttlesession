
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'prompt',
      injectRegister: 'auto',
      manifest: {
        name: 'ShuttleSession',
        short_name: 'ShuttleSession',
        description: 'Manage badminton sessions and player queues',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'fullscreen',
        orientation: 'portrait',
        icons: [
          {
            src: '/lovable-uploads/55cb3b3b-e914-4a52-861a-cd69e1ec3f02.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/lovable-uploads/55cb3b3b-e914-4a52-861a-cd69e1ec3f02.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/lovable-uploads/55cb3b3b-e914-4a52-861a-cd69e1ec3f02.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
