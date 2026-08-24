// @ts-check
import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://www.leptris.org',
  integrations: [vue(), mdx()],
  redirects: {
    '/blog/beating-lxml-at-everything': '/blog/2026-08-24-beating-lxml-at-everything',
    '/blog/leptris-1-2-0-the-race-per-language': '/blog/2026-08-23-leptris-1-2-0-the-race-per-language',
  },
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
});
