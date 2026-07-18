// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxt/ui', '@nuxtjs/i18n'],
  css: ['~/assets/css/main.css'],

  // Editorial brand: off-white canvas, light-first. Dark stays available.
  colorMode: {
    preference: 'light',
    fallback: 'light',
  },

  app: {
    head: {
      // `<html lang>` is managed reactively by @nuxtjs/i18n (see app/app.vue's
      // useLocaleHead wiring) — no static default here.
      link: [
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
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

  i18n: {
    defaultLocale: 'pl',
    strategy: 'no_prefix',
    langDir: 'locales',
    locales: [
      { code: 'pl', language: 'pl-PL', name: 'Polski', file: 'pl.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_locale',
      redirectOn: 'root',
      fallbackLocale: 'pl',
    },
  },
})
