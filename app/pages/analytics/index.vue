<script setup lang="ts">
import type { AnalyticsOverview, AnalyticsPostRow } from '~~/shared/types/api'

useHead({ title: 'Analityka — Shoot SEO' })

const { current } = useWorkspace()
const { fetchOverview, fetchTopPosts } = useAnalytics()

const PRESETS = [
  { days: 7, label: '7 dni' },
  { days: 28, label: '28 dni' },
  { days: 90, label: '90 dni' },
]

const rangeDays = ref(28)
const range = computed(() => lastNDaysRange(rangeDays.value))

const overviewQuery = useAsyncData(
  'analytics-overview',
  () => fetchOverview(range.value),
  { watch: [rangeDays, () => current.value?.id], default: () => null as AnalyticsOverview | null },
)
const postsQuery = useAsyncData(
  'analytics-top-posts',
  () => fetchTopPosts(range.value, 10),
  { watch: [rangeDays, () => current.value?.id], default: () => [] as AnalyticsPostRow[] },
)

await Promise.all([overviewQuery, postsQuery])

const { data: overview, status: overviewStatus } = overviewQuery
const { data: topPosts, status: postsStatus } = postsQuery

const loading = computed(() => overviewStatus.value === 'pending' || postsStatus.value === 'pending')

const hasData = computed(() => {
  const o = overview.value
  const rows = topPosts.value ?? []
  return (!!o && (o.views > 0 || o.series.some(s => s.views > 0))) || rows.length > 0
})

/** `YYYY-MM-DD` -> `DD.MM.YYYY` (timezone-safe). */
function plDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}.${m}.${y}`
}
</script>

<template>
  <div>
    <AppPageHeader
      eyebrow="Analityka"
      title="Analityka"
      description="Ruch i zaangażowanie dla treści opublikowanych w tym workspace."
    >
      <template #actions>
        <div class="seg" role="group" aria-label="Zakres dat">
          <button
            v-for="preset in PRESETS"
            :key="preset.days"
            type="button"
            class="seg-item"
            :class="{ 'seg-item--active': rangeDays === preset.days }"
            @click="rangeDays = preset.days"
          >
            {{ preset.label }}
          </button>
        </div>
      </template>
    </AppPageHeader>

    <div v-if="loading" class="flex justify-center py-24">
      <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin" style="color: var(--muted)" />
    </div>

    <AppEmptyState
      v-else-if="!hasData"
      icon="i-lucide-chart-line"
      title="Brak danych analitycznych"
      description="Gdy Twoje opublikowane treści zaczną zbierać ruch, pojawią się tu wyświetlenia, unikalni użytkownicy i czas zaangażowania."
    >
      <template #action>
        <UButton to="/posts" icon="i-lucide-file-text" color="neutral" variant="outline">Przejdź do treści</UButton>
      </template>
    </AppEmptyState>

    <div v-else class="space-y-6">
      <AppAnalyticsKpis
        :views="overview?.views ?? 0"
        :uniques="overview?.uniques ?? 0"
        :avg-engagement-ms="overview?.avg_engagement_ms ?? 0"
      />

      <section class="u-card p-6">
        <div class="mb-4 flex items-baseline justify-between gap-4">
          <h2 class="card-title">Dzienny ruch</h2>
          <span class="text-xs" style="color: var(--muted-soft)">{{ plDate(range.from) }} — {{ plDate(range.to) }}</span>
        </div>
        <AppAnalyticsChart :series="overview?.series ?? []" />
      </section>

      <section class="u-card overflow-hidden">
        <div class="px-6 py-5" style="border-bottom: 1px solid var(--hairline)">
          <h2 class="card-title">Top posty</h2>
        </div>

        <div v-if="(topPosts?.length ?? 0) === 0" class="px-6 py-12 text-center text-sm" style="color: var(--muted-soft)">
          Brak wyświetleń w tym okresie.
        </div>

        <table v-else class="analytics-table w-full">
          <thead>
            <tr>
              <th class="text-left">Tytuł</th>
              <th class="text-right">Wyświetlenia</th>
              <th class="text-right">Unikalni</th>
              <th class="text-right">Śr. czas</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="post in topPosts" :key="post.post_id">
              <td>
                <NuxtLink :to="`/analytics/${post.slug}`" class="row-link block min-w-0">
                  <span class="block truncate font-medium" style="color: var(--ink)">{{ post.title }}</span>
                  <span class="block truncate text-xs" style="color: var(--muted-soft)">/{{ post.slug }}</span>
                </NuxtLink>
              </td>
              <td class="text-right tabular-nums">{{ formatCount(post.views) }}</td>
              <td class="text-right tabular-nums">{{ formatCount(post.uniques) }}</td>
              <td class="text-right tabular-nums">{{ formatEngagement(post.avg_engagement_ms) }}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  </div>
</template>

<style scoped>
/* Segmented range control (editorial pill group). */
.seg {
  display: inline-flex;
  padding: 3px;
  border-radius: 9999px;
  background: var(--surface-strong);
  border: 1px solid var(--hairline);
}
.seg-item {
  padding: 0.4rem 0.85rem;
  border-radius: 9999px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--muted);
  transition: background 0.18s ease, color 0.18s ease;
}
.seg-item:hover {
  color: var(--ink);
}
.seg-item--active {
  background: var(--surface-card);
  color: var(--ink);
  box-shadow: var(--shadow-soft);
}

/* Read-only metrics table, matching the posts table's editorial styling. */
.analytics-table thead th {
  padding: 0.85rem 1.25rem;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--muted);
  border-bottom: 1px solid var(--hairline);
}
.analytics-table tbody td {
  padding: 0.85rem 1.25rem;
  vertical-align: middle;
  color: var(--body);
  border-top: 1px solid var(--hairline-soft);
}
.analytics-table tbody tr {
  transition: background-color 0.15s ease;
}
.analytics-table tbody tr:hover {
  background: var(--surface-strong);
}
.row-link:hover .font-medium {
  text-decoration: underline;
  text-underline-offset: 3px;
}
</style>
