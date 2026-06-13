<script setup lang="ts">
const { loggedIn, me, init } = useCurrentUser()

onMounted(init)

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await navigateTo('/login')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Topbar -->
    <header class="bg-white border-b border-gray-200">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        <NuxtLink to="/dashboard" class="text-base font-semibold text-gray-900">
          PageBuilder
        </NuxtLink>

        <nav class="flex items-center gap-4 text-sm">
          <NuxtLink
            to="/dashboard"
            class="text-gray-600 hover:text-gray-900 transition-colors"
            active-class="text-indigo-600 font-medium"
          >
            Halaman
          </NuxtLink>

          <div class="h-4 w-px bg-gray-200" />

          <span class="text-gray-500">
            {{ me?.profile?.username ?? '...' }}
          </span>

          <button
            class="text-gray-500 hover:text-gray-900 transition-colors"
            @click="logout"
          >
            Keluar
          </button>
        </nav>
      </div>
    </header>

    <!-- Content -->
    <main class="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <slot />
    </main>
  </div>
</template>
