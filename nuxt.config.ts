// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',

  future: {
    compatibilityVersion: 4,
  },

  devtools: { enabled: true },

  modules: [
    'nuxt-auth-utils',
    '@nuxtjs/tailwindcss',
  ],

  // Semua komponen di app/components/ auto-import tanpa prefix subfolder
  components: [
    { path: '~/components', pathPrefix: false },
  ],

  // alias: {
  //   '#shared': '../pagebuilder-fixed/shared',
  //   '#server': '../pagebuilder-fixed/server',
  // },

  // Nitro server config
  nitro: {
    experimental: {
      openAPI: true,
    },
  },

  // Runtime config — server-only unless prefixed with public
  runtimeConfig: {
    sessionPassword: process.env.NUXT_SESSION_PASSWORD ?? '',
    databaseUrl: process.env.DATABASE_URL ?? '',
    public: {
      appUrl: process.env.NUXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
    },
  },

  typescript: {
    strict: true,
    typeCheck: false,
  },
})
