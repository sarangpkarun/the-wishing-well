/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

/**
 * Open Graph images must be absolute URLs. Resolve the public site URL at build time:
 * VITE_SITE_URL if set, else Vercel's production domain, else the default below.
 */
const siteUrl = (
  process.env.VITE_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '') ||
  'https://thewishingwell.lol'
).replace(/\/+$/, '')

const siteUrlPlugin = (): Plugin => ({
  name: 'site-url',
  transformIndexHtml: (html) => html.replaceAll('%SITE_URL%', siteUrl),
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), siteUrlPlugin()],
  test: { environment: 'node' },
})
