<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const route = useRoute()
const pageId = route.params.pageId as string

const { data: page, refresh, pending } = await useFetch(`/api/pages/${pageId}`)

const saving = ref(false)
const publishing = ref(false)
const toast = ref<{ message: string; type: 'success' | 'error' } | null>(null)

function showToast(message: string, type: 'success' | 'error' = 'success') {
  toast.value = { message, type }
  setTimeout(() => (toast.value = null), 3000)
}

// ── Profile section ──────────────────────────────────────────────────────────

const profileForm = reactive({ displayName: '', bio: '' })
const { me, init } = useCurrentUser()
onMounted(async () => {
  await init()
  profileForm.displayName = me.value?.profile?.displayName ?? ''
  profileForm.bio = me.value?.profile?.bio ?? ''
})

async function saveProfile() {
  saving.value = true
  try {
    await $fetch('/api/me/profile', { method: 'PATCH', body: profileForm })
    showToast('Profil disimpan')
  } catch {
    showToast('Gagal menyimpan profil', 'error')
  } finally {
    saving.value = false
  }
}

// ── Links ────────────────────────────────────────────────────────────────────

const newLink = reactive({ label: '', url: '' })
const addingLink = ref(false)

async function addLink() {
  if (!newLink.label || !newLink.url) return
  addingLink.value = true
  try {
    await $fetch(`/api/pages/${pageId}/links`, {
      method: 'POST',
      body: { label: newLink.label, url: newLink.url },
    })
    newLink.label = ''
    newLink.url = ''
    await refresh()
    showToast('Link ditambahkan')
  } catch (err: any) {
    showToast(err?.data?.statusMessage ?? 'Gagal menambahkan link', 'error')
  } finally {
    addingLink.value = false
  }
}

async function toggleLink(linkId: string, isActive: boolean) {
  try {
    await $fetch(`/api/pages/${pageId}/links/${linkId}`, {
      method: 'PATCH',
      body: { isActive: !isActive },
    })
    await refresh()
  } catch {
    showToast('Gagal mengubah status link', 'error')
  }
}

async function deleteLink(linkId: string) {
  try {
    await $fetch(`/api/pages/${pageId}/links/${linkId}`, { method: 'DELETE' })
    await refresh()
    showToast('Link dihapus')
  } catch {
    showToast('Gagal menghapus link', 'error')
  }
}

// ── Publish ──────────────────────────────────────────────────────────────────

async function publishPage() {
  publishing.value = true
  try {
    await $fetch(`/api/pages/${pageId}/publish`, { method: 'POST' })
    await refresh()
    showToast('Halaman dipublikasikan')
  } catch {
    showToast('Gagal mempublikasikan', 'error')
  } finally {
    publishing.value = false
  }
}

const isPublished = computed(() => page.value?.status === 'published')
const publicUrl = computed(() => {
  const config = useRuntimeConfig()
  return `${config.public.appUrl}/${me.value?.profile?.username}`
})
</script>

<template>
  <DashboardShell>
    <!-- Toast -->
    <Transition name="fade">
      <div
        v-if="toast"
        class="fixed top-4 right-4 z-50 rounded-md px-4 py-3 text-sm font-medium shadow-lg"
        :class="toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'"
      >
        {{ toast.message }}
      </div>
    </Transition>

    <div v-if="pending" class="text-sm text-gray-500">Memuat...</div>

    <div v-else-if="page" class="space-y-8 max-w-2xl">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ page.title }}</h1>
          <p class="mt-1 text-sm text-gray-500">
            <span
              class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium mr-2"
              :class="isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'"
            >
              {{ isPublished ? 'Publik' : 'Draft' }}
            </span>
            <a
              v-if="isPublished"
              :href="publicUrl"
              target="_blank"
              class="text-indigo-600 hover:underline"
            >
              {{ publicUrl }}
            </a>
          </p>
        </div>

        <div class="flex items-center gap-3">
          <NuxtLink
            :to="`/dashboard/pages/${pageId}/analytics`"
            class="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Analytics
          </NuxtLink>

        <button
          :disabled="publishing"
          class="rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
          :class="isPublished
            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            : 'bg-indigo-600 text-white hover:bg-indigo-700'"
          @click="publishPage"
        >
          {{ publishing ? 'Memproses...' : isPublished ? 'Perbarui halaman' : 'Publikasikan' }}
        </button>
        </div>
      </div>

      <!-- Profile section -->
      <section class="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
        <h2 class="font-semibold text-gray-900">Profil</h2>

        <div>
          <label class="block text-sm font-medium text-gray-700">Nama tampilan</label>
          <input
            v-model="profileForm.displayName"
            type="text"
            maxlength="60"
            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Bio</label>
          <textarea
            v-model="profileForm.bio"
            rows="3"
            maxlength="200"
            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
          />
        </div>

        <button
          :disabled="saving"
          class="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors disabled:opacity-50"
          @click="saveProfile"
        >
          {{ saving ? 'Menyimpan...' : 'Simpan profil' }}
        </button>
      </section>

      <!-- Links section -->
      <section class="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
        <h2 class="font-semibold text-gray-900">Link</h2>

        <!-- Existing links -->
        <ul v-if="page.links?.length" class="space-y-2">
          <li
            v-for="link in page.links"
            :key="link.id"
            class="flex items-center gap-3 rounded-md border border-gray-200 px-4 py-3"
            :class="!link.isActive ? 'opacity-50' : ''"
          >
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{{ link.label }}</p>
              <p class="text-xs text-gray-400 truncate">{{ link.url }}</p>
            </div>
            <button
              class="text-xs px-2 py-1 rounded border border-gray-200 hover:bg-gray-50 transition-colors"
              @click="toggleLink(link.id, link.isActive)"
            >
              {{ link.isActive ? 'Sembunyikan' : 'Tampilkan' }}
            </button>
            <button
              class="text-xs text-red-500 hover:text-red-700 px-2 py-1"
              @click="deleteLink(link.id)"
            >
              Hapus
            </button>
          </li>
        </ul>

        <p v-else class="text-sm text-gray-400">Belum ada link. Tambahkan di bawah.</p>

        <!-- Add link form -->
        <div class="space-y-3 pt-2 border-t border-gray-100">
          <h3 class="text-sm font-medium text-gray-700">Tambah link baru</h3>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-gray-500 mb-1">Label</label>
              <input
                v-model="newLink.label"
                type="text"
                placeholder="GitHub"
                maxlength="100"
                class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">URL</label>
              <input
                v-model="newLink.url"
                type="url"
                placeholder="https://github.com/kamu"
                class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
          <button
            :disabled="addingLink || !newLink.label || !newLink.url"
            class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            @click="addLink"
          >
            {{ addingLink ? 'Menambahkan...' : 'Tambah link' }}
          </button>
        </div>
      </section>
    </div>

    <div v-else class="text-sm text-red-500">Halaman tidak ditemukan.</div>
  </DashboardShell>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
