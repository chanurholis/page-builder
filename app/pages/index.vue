<script setup lang="ts">
definePageMeta({ layout: false })

const { loggedIn } = useUserSession()

// Redirect ke dashboard jika sudah login
watchEffect(() => {
  if (loggedIn.value) navigateTo('/dashboard')
})
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-white px-4">
    <div class="text-center max-w-lg space-y-6">
      <h1 class="text-4xl font-bold text-gray-900 leading-tight">
        Buat halaman publik kamu sendiri
      </h1>
      <p class="text-lg text-gray-500">
        Satu link untuk semua — portofolio, link-in-bio, atau landing page sederhana.
      </p>
      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <NuxtLink
          to="/signup"
          class="rounded-md bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          Mulai gratis
        </NuxtLink>
        <NuxtLink
          to="/login"
          class="rounded-md border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Masuk
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
