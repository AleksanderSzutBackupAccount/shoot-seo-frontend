<script setup lang="ts">
// The three headline metrics, shared by the workspace overview and the
// per-post drill-down. Styled after the dashboard stat cards.
const props = defineProps<{
  views: number
  uniques: number
  avgEngagementMs: number
}>()

const { t, locale } = useI18n()

const cards = computed(() => [
  { eyebrow: t('analytics.colViews'), icon: 'i-lucide-eye', value: formatCount(props.views, locale.value), hint: t('analytics.hintViews') },
  { eyebrow: t('analytics.colUniques'), icon: 'i-lucide-users', value: formatCount(props.uniques, locale.value), hint: t('analytics.hintUniques') },
  { eyebrow: t('analytics.avgEngagementEyebrow'), icon: 'i-lucide-timer', value: formatEngagement(props.avgEngagementMs), hint: t('analytics.hintAvgEngagement') },
])
</script>

<template>
  <div class="grid gap-4 sm:grid-cols-3">
    <div v-for="card in cards" :key="card.eyebrow" class="u-card u-card--hover p-6">
      <div class="flex items-center justify-between">
        <p class="eyebrow">{{ card.eyebrow }}</p>
        <UIcon :name="card.icon" class="size-[18px]" style="color: var(--muted-soft)" />
      </div>
      <p class="font-display mt-4 leading-none tabular-nums" style="font-size: 2.5rem; color: var(--ink)">{{ card.value }}</p>
      <p class="mt-2 text-sm" style="color: var(--muted)">{{ card.hint }}</p>
    </div>
  </div>
</template>
