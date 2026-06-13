<script setup lang="ts">
definePageMeta({ layout: false })

const form = reactive({
  email: '',
  password: '',
})

const serverError = ref('')
const loading = ref(false)

async function submit() {
  serverError.value = ''
  loading.value = true

  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: form,
    })
    await navigateTo('/dashboard')
  } catch (err: any) {
    serverError.value = err?.data?.statusMessage ?? 'Terjadi kesalahan, coba lagi.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="w-full max-w-md space-y-8">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900">Masuk</h1>
        <p class="mt-2 text-sm text-gray-600">
          Belum punya akun?
          <NuxtLink to="/signup" class="font-medium text-indigo-600 hover:text-indigo-500">
            Daftar gratis
          </NuxtLink>
        </p>
      </div>

      <form class="mt-8 space-y-5" @submit.prevent="submit">
        <div v-if="serverError" class="rounded-md bg-red-50 p-4 text-sm text-red-700">
          {{ serverError }}
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700" for="email">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            autocomplete="email"
            required
            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700" for="password">Password</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            autocomplete="current-password"
            required
            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full flex justify-center rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {{ loading ? 'Memproses...' : 'Masuk' }}
        </button>
      </form>
    </div>
  </div>
</template>
