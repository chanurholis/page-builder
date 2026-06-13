<script setup lang="ts">
import type { LinkClickStat } from '../../../shared/types/analytics'

const props = defineProps<{
  rows: LinkClickStat[]
  totalClicks: number
}>()
</script>

<template>
  <div class="rounded-lg border border-gray-200 bg-white overflow-hidden">
    <div class="px-5 py-4 border-b border-gray-100">
      <h3 class="text-sm font-semibold text-gray-900">Klik per link</h3>
    </div>

    <table v-if="rows.length" class="w-full text-sm">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-5 py-3 text-left text-xs font-medium text-gray-500">Link</th>
          <th class="px-5 py-3 text-right text-xs font-medium text-gray-500">Klik</th>
          <th class="px-5 py-3 text-right text-xs font-medium text-gray-500">Share</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        <tr v-for="row in rows" :key="row.linkId" class="hover:bg-gray-50 transition-colors">
          <td class="px-5 py-3 text-gray-700 max-w-xs truncate">{{ row.label }}</td>
          <td class="px-5 py-3 text-right font-medium tabular-nums text-gray-900">
            {{ row.clicks.toLocaleString('id-ID') }}
          </td>
          <td class="px-5 py-3 text-right text-gray-400 tabular-nums">
            {{
              totalClicks > 0
                ? ((row.clicks / totalClicks) * 100).toFixed(1) + '%'
                : '—'
            }}
          </td>
        </tr>
      </tbody>
    </table>

    <div v-else class="px-5 py-8 text-center text-sm text-gray-400">
      Belum ada klik tercatat.
    </div>
  </div>
</template>
