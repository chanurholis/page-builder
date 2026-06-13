<script setup lang="ts">
import type { AnalyticsSummary } from '../../../../../shared/types/analytics'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const pageId = route.params.pageId as string

const { data, pending, error, refresh } = await useFetch<AnalyticsSummary>(
  `/api/pages/${pageId}/analytics`,
)

const ctrFormatted = computed(() => {
  if (!data.value) return '—'
  return (data.value.ctr * 100).toFixed(1) + '%'
})

function formatTime(iso: string) {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso))
}
</script>

<template>
  <DashboardShell>
    <div class="space-y-8">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <NuxtLink
            :to="`/dashboard/pages/${pageId}/editor`"
            class="text-sm text-indigo-600 hover:underline"
          >
            ← Kembali ke editor
          </NuxtLink>
          <h1 class="mt-2 text-2xl font-bold text-gray-900">Analytics</h1>
        </div>
        <button
          class="text-sm text-gray-500 hover:text-gray-800 transition-colors"
          @click="refresh"
        >
          Refresh
        </button>
      </div>

      <div v-if="pending" class="text-sm text-gray-400">Memuat data...</div>

      <template v-else-if="data">
        <!-- Metric cards -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCard
            label="Total kunjungan"
            :value="data.totalVisits.toLocaleString('id-ID')"
          />
          <MetricCard
            label="Total klik"
            :value="data.totalClicks.toLocaleString('id-ID')"
          />
          <MetricCard
            label="CTR"
            :value="ctrFormatted"
            sub="klik ÷ kunjungan"
          />
        </div>

        <!-- Clicks per link table -->
        <LinkClicksTable
          :rows="data.clicksPerLink"
          :total-clicks="data.totalClicks"
        />

        <!-- Recent visits -->
        <div class="rounded-lg border border-gray-200 bg-white overflow-hidden">
          <div class="px-5 py-4 border-b border-gray-100">
            <h3 class="text-sm font-semibold text-gray-900">Kunjungan terbaru</h3>
          </div>

          <table v-if="data.recentVisits.length" class="w-full text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-5 py-3 text-left text-xs font-medium text-gray-500">Waktu</th>
                <th class="px-5 py-3 text-left text-xs font-medium text-gray-500">Referrer</th>
                <th class="px-5 py-3 text-left text-xs font-medium text-gray-500">UTM Source</th>
                <th class="px-5 py-3 text-left text-xs font-medium text-gray-500">Campaign</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr
                v-for="visit in data.recentVisits"
                :key="visit.id"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-5 py-3 text-gray-500 whitespace-nowrap tabular-nums text-xs">
                  {{ formatTime(visit.timestamp) }}
                </td>
                <td class="px-5 py-3 text-gray-600 max-w-[180px] truncate text-xs">
                  {{ visit.referrer ?? '—' }}
                </td>
                <td class="px-5 py-3 text-gray-600 text-xs">
                  {{ visit.utmSource ?? '—' }}
                </td>
                <td class="px-5 py-3 text-gray-600 text-xs">
                  {{ visit.utmCampaign ?? '—' }}
                </td>
              </tr>
            </tbody>
          </table>

          <div v-else class="px-5 py-8 text-center text-sm text-gray-400">
            Belum ada kunjungan tercatat.
          </div>
        </div>
      </template>

      <div v-else-if="error" class="text-sm text-red-500">
        Gagal memuat analytics.
      </div>
    </div>
  </DashboardShell>
</template>
