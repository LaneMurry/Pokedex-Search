import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Content-Security-Policy for production builds.
// Injected at build time (not as a static meta tag) so it cannot break
// `vite dev`, where the React refresh preamble is an inline script.
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  // MUI/Emotion inject styles via <style> tags and inline style attributes
  "style-src 'self' 'unsafe-inline'",
  // VT323 is self-hosted (public/fonts/), so 'self' is all we need.
  "font-src 'self'",
  "img-src 'self' data: https://pokeapi.co https://raw.githubusercontent.com",
  "connect-src 'self' https://pokeapi.co",
  "object-src 'none'",
  "base-uri 'self'",
  // form-action isn't covered by default-src, so lock it down explicitly.
  "form-action 'self'",
].join('; ')

function cspMetaPlugin() {
  return {
    name: 'inject-csp-meta',
    apply: 'build',
    transformIndexHtml(html) {
      return {
        html,
        tags: [
          {
            tag: 'meta',
            attrs: { 'http-equiv': 'Content-Security-Policy', content: CSP },
            injectTo: 'head-prepend',
          },
        ],
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), cspMetaPlugin()],
})