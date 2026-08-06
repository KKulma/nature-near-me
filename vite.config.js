import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Nature Near Me - Discover Natural Spaces',
        short_name: 'NatureNearMe',
        description: 'Find free public parks, forests, nature reserves, and footpaths near you.',
        theme_color: '#10b981',
        background_color: '#064e3b',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'maplibre': ['maplibre-gl'],
          'turf': ['@turf/turf'],
          'vendor': ['react', 'react-dom', 'lucide-react', 'idb-keyval']
        }
      }
    }
  }
});
