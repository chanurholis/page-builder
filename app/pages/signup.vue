<script setup lang="ts">
definePageMeta({ layout: false })

const form = reactive({
  email: '',
  password: '',
  username: '',
  displayName: '',
})

const errors = ref<Record<string, string[]>>({})
const serverError = ref('')
const loading = ref(false)

async function submit() {
  errors.value = {}
  serverError.value = ''
  loading.value = true

  try {
    const data = await $fetch('/api/auth/signup', {
      method: 'POST',
      body: form,
    })
    await navigateTo('/dashboard')
  } catch (err: any) {
    if (err?.data?.data) {
      errors.value = err.data.data
    } else {
      serverError.value = err?.data?.statusMessage ?? 'Terjadi kesalahan, coba lagi.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="w-full max-w-md space-y-8">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900">Buat akun</h1>
        <p class="mt-2 text-sm text-gray-600">
          Sudah punya akun?
          <NuxtLink to="/login" class="font-medium text-indigo-600 hover:text-indigo-500">
            Masuk
          </NuxtLink>
        </p>
      </div>

      <form class="mt-8 space-y-5" @submit.prevent="submit">
        <div v-if="serverError" class="rounded-md bg-red-50 p-4 text-sm text-red-700">
          {{ serverError }}
        </div>

        <!-- Email -->
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
          <p v-if="errors.email" class="mt-1 text-xs text-red-600">{{ errors.email[0] }}</p>
        </div>

        <!-- Username -->
        <div>
          <label class="block text-sm font-medium text-gray-700" for="username">Username</label>
          <div class="mt-1 flex rounded-md shadow-sm">
            <span
              class="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 text-sm"
            >
              yoursite.com/
            </span>
            <input
              id="username"
              v-model="form.username"
              type="text"
              autocomplete="username"
              required
              pattern="[a-z0-9_-]+"
              class="block w-full rounded-r-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <p v-if="errors.username" class="mt-1 text-xs text-red-600">{{ errors.username[0] }}</p>
        </div>

        <!-- Display name (optional) -->
        <div>
          <label class="block text-sm font-medium text-gray-700" for="displayName">
            Nama tampilan
            <span class="text-gray-400 font-normal">(opsional)</span>
          </label>
          <input
            id="displayName"
            v-model="form.displayName"
            type="text"
            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <!-- Password -->
        <div>
          <label class="block text-sm font-medium text-gray-700" for="password">Password</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            autocomplete="new-password"
            required
            minlength="8"
            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <p v-if="errors.password" class="mt-1 text-xs text-red-600">{{ errors.password[0] }}</p>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full flex justify-center rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {{ loading ? 'Memproses...' : 'Buat akun' }}
        </button>
      </form>
    </div>
  </div>
</template>
