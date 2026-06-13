// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.dineshreddyco.com',
  output: 'server',
  adapter: vercel()
});

