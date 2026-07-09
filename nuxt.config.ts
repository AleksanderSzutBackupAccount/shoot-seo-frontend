// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxt/ui'],
  css: ['~/assets/css/main.css'],

  // Editorial brand: off-white canvas, light-first. Dark stays available.
  colorMode: {
    preference: 'light',
    fallback: 'light',
  },

  app: {
    head: {
      htmlAttrs: { lang: 'pl' },
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          // Fraunces (editorial display serif, light 300 + optical sizing) + Inter (UI/body).
          href: 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500&family=Inter:wght@400;500;600;700&display=swap',
        },
      ],
    },
  },

  runtimeConfig: {
    // Server-only. Base URL of the Laravel REST API the BFF proxies to.
    apiBase: process.env.API_BASE || 'http://localhost:8000/api',
  },
})
