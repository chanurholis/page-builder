<script setup lang="ts">
import { isReservedSlug } from '../../shared/utils/reserved-slugs'
import type { PublicPageData, PublicLink } from '../../shared/types/page'

definePageMeta({ layout: false })

const route = useRoute()
const username = (route.params.username as string).toLowerCase()

// Guard: jangan render reserved slug di sini
if (isReservedSlug(username)) {
  throw createError({ statusCode: 404, fatal: true })
}

const { data, error } = await useFetch<
  PublicPageData & { standaloneLinks: PublicLink[] }
>(`/api/public/${username}`)

if (error.value) {
  throw createError({ statusCode: 404, statusMessage: 'Halaman tidak ditemukan', fatal: true })
}

// SEO
const seo = computed(() => data.value?.page?.seoJson as Record<string, string> | null ?? null)
useHead({
  title: seo.value?.title ?? data.value?.profile?.displayName ?? username,
  meta: [
    { name: 'description', content: seo.value?.description ?? data.value?.profile?.bio ?? '' },
  ],
})

// Track visit
useTrackVisit(username)
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div v-if="data" class="max-w-lg mx-auto px-4 py-12 space-y-6">
      <!-- Profile header -->
      <header class="text-center space-y-3">
        <img
          v-if="data.profile.avatarUrl"
          :src="data.profile.avatarUrl"
          :alt="data.profile.displayName ?? username"
          class="w-20 h-20 rounded-full mx-auto object-cover ring-2 ring-white shadow"
        />
        <div
          v-else
          class="w-20 h-20 rounded-full mx-auto bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-600 shadow"
        >
          {{ (data.profile.displayName ?? username).charAt(0).toUpperCase() }}
        </div>

        <div>
          <h1 class="text-xl font-bold text-gray-900">
            {{ data.profile.displayName ?? username }}
          </h1>
          <p v-if="data.profile.bio" class="mt-1 text-sm text-gray-500">
            {{ data.profile.bio }}
          </p>
        </div>
      </header>

      <!-- Blocks -->
      <main class="space-y-2">
        <BlockRenderer
          v-for="block in data.blocks"
          :key="block.id"
          :block="block"
        />

        <!-- Standalone links (tidak terikat block) -->
        <div v-if="data.standaloneLinks?.length" class="space-y-3 pt-2">
          <a
            v-for="link in data.standaloneLinks"
            :key="link.id"
            :href="link.redirectUrl"
            class="flex items-center justify-center w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            {{ link.label }}
          </a>
        </div>
      </main>

      <!-- Footer -->
      <footer class="text-center pt-4">
        <NuxtLink
          to="/signup"
          class="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          Buat halaman kamu sendiri →
        </NuxtLink>
      </footer>
    </div>
  </div>
</template>
