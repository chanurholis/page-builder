<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  sub?: string
}>()
</script>

<template>
  <div class="rounded-lg border border-gray-200 bg-white p-5">
    <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">{{ label }}</p>
    <p class="mt-2 text-3xl font-bold text-gray-900 tabular-nums">{{ value }}</p>
    <p v-if="sub" class="mt-1 text-xs text-gray-400">{{ sub }}</p>
  </div>
</template>
