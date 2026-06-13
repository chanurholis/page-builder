<script setup lang="ts">
import type { PublicBlock } from '../../../shared/types/page'

defineProps<{ block: PublicBlock }>()
</script>

<template>
  <!-- Hero block -->
  <div v-if="block.type === 'hero'" class="text-center py-6">
    <h2
      v-if="block.contentJson.heading"
      class="text-2xl font-bold text-gray-900"
      :style="block.styleJson"
    >
      {{ block.contentJson.heading }}
    </h2>
    <p v-if="block.contentJson.subheading" class="mt-2 text-gray-500 text-sm">
      {{ block.contentJson.subheading }}
    </p>
  </div>

  <!-- Text block -->
  <div v-else-if="block.type === 'text'" class="py-3">
    <p class="text-gray-700 text-sm whitespace-pre-line" :style="block.styleJson">
      {{ block.contentJson.text }}
    </p>
  </div>

  <!-- Link list block -->
  <div v-else-if="block.type === 'link_list'" class="space-y-3 py-3">
    <a
      v-for="link in block.links"
      :key="link.id"
      :href="link.redirectUrl"
      class="flex items-center justify-center w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all"
    >
      {{ link.label }}
    </a>
  </div>

  <!-- Image block -->
  <div v-else-if="block.type === 'image'" class="py-3">
    <img
      v-if="block.contentJson.url"
      :src="String(block.contentJson.url)"
      :alt="String(block.contentJson.alt ?? '')"
      class="w-full rounded-lg object-cover"
      loading="lazy"
    />
  </div>

  <!-- Unknown block type — render nothing -->
  <div v-else />
</template>
