// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'http://localhost:4321',
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      external: ['yjs', 'y-websocket', '@tiptap/pm']
    }
  },
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  integrations: [react(), sitemap()],
  // Performance & optimization settings
  prefetch: {
    prefetchAll: true
  },
  // Image optimization
  image: {
    remotePatterns: [
      { protocol: 'https' }
    ]
  },
  // Compression
  compressHTML: true,
  // Security headers handled by Node adapter
  experimental: {
    clientPrerender: true
  }
});