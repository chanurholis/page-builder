<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { data: pages, refresh, pending } = useFetch('/api/pages')
const { me, init } = useCurrentUser()

onMounted(init)
</script>

<template>
  <DashboardShell>
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Halaman saya</h1>
          <p class="mt-1 text-sm text-gray-500">
            Kelola halaman publik kamu di sini.
          </p>
        </div>
      </div>

      <div v-if="pending" class="text-sm text-gray-500">Memuat...</div>

      <div v-else-if="pages && pages.length > 0" class="grid gap-4 sm:grid-cols-2">
        <NuxtLink
          v-for="page in pages"
          :key="page.id"
          :to="`/dashboard/pages/${page.id}/editor`"
          class="group block rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all"
        >
          <div class="flex items-start justify-between">
            <div>
              <h2 class="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                {{ page.title }}
              </h2>
              <p class="mt-1 text-sm text-gray-500">
                /{{ me?.profile?.username }}/{{ page.slug }}
              </p>
            </div>
            <span
              class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
              :class="page.status === 'published'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600'"
            >
              {{ page.status === 'published' ? 'Publik' : 'Draft' }}
            </span>
          </div>
        </NuxtLink>
      </div>

      <div
        v-else
        class="rounded-lg border-2 border-dashed border-gray-200 bg-white p-12 text-center"
      >
        <p class="text-gray-500 text-sm">Belum ada halaman.</p>
        <p class="mt-1 text-xs text-gray-400">
          Halaman default kamu akan muncul di sini setelah setup selesai.
        </p>
      </div>
    </div>
  </DashboardShell>
</template>
