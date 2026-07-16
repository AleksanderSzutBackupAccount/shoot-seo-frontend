<script setup lang="ts">
import type { AnalyticsOverview } from '~~/shared/types/api'

const route = useRoute()
const slug = computed(() => String(route.params.slug))

useHead({ title: () => `Analityka: ${slug.value} — Shoot SEO` })

const { current } = useWorkspace()
const { fetchPost } = useAnalytics()

const PRESETS = [
  { days: 7, label: '7 dni' },
  { days: 28, label: '28 dni' },
  { days: 90, label: '90 dni' },
]

const rangeDays = ref(28)
const range = computed(() => lastNDaysRange(rangeDays.value))

const { data: overview, status } = await useAsyncData(
  () => `analytics-post-${slug.value}`,
  () => fetchPost(slug.value, range.value),
  { watch: [rangeDays, slug, () => current.value?.id], default: () => null as AnalyticsOverview | null },
)

const loading = computed(() => status.value === 'pending')
const hasData = computed(() => {
  const o = overview.value
  return !!o && (o.views > 0 || o.series.some(s => s.views > 0))
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
      eyebrow="Analityka / post"
      :title="slug"
      description="Ruch i zaangażowanie dla tego posta w wybranym okresie."
    >
      <template #actions>
        <div class="flex items-center gap-3">
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
          <UButton to="/analytics" icon="i-lucide-arrow-left" color="neutral" variant="ghost" size="sm">
            Wróć
          </UButton>
        </div>
      </template>
    </AppPageHeader>

    <div v-if="loading" class="flex justify-center py-24">
      <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin" style="color: var(--muted)" />
    </div>

    <AppEmptyState
      v-else-if="!hasData"
      icon="i-lucide-chart-line"
      title="Brak danych dla tego posta"
      description="Ten post nie zebrał jeszcze ruchu w wybranym okresie."
    >
      <template #action>
        <UButton to="/analytics" icon="i-lucide-arrow-left" color="neutral" variant="outline">Wróć do analityki</UButton>
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
    </div>
  </div>
</template>

<style scoped>
/* Segmented range control (editorial pill group) — matches analytics/index.vue. */
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
</style>
