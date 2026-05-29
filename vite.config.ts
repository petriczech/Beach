import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Na GitHub Pages běží appka v podadresáři (např. /beach/). Workflow nastaví
// VITE_BASE; lokálně se použije relativní './'.
export default defineConfig({
  base: process.env.VITE_BASE || './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Beach Zápis — záznam volejbalového zápasu',
        short_name: 'Beach Zápis',
        description:
          'Záznam plážového volejbalového zápasu (2v2): podání, chyby, páska, skóre a statistiky hráčů.',
        theme_color: '#0b7285',
        background_color: '#0b7285',
        display: 'standalone',
        orientation: 'portrait',
        lang: 'cs',
        start_url: './',
        scope: './',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'node',
  },
});
