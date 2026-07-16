<script setup lang="ts">
// The three headline metrics, shared by the workspace overview and the
// per-post drill-down. Styled after the dashboard stat cards.
const props = defineProps<{
  views: number
  uniques: number
  avgEngagementMs: number
}>()

const cards = computed(() => [
  { eyebrow: 'Wyświetlenia', icon: 'i-lucide-eye', value: formatCount(props.views), hint: 'w wybranym okresie' },
  { eyebrow: 'Unikalni', icon: 'i-lucide-users', value: formatCount(props.uniques), hint: 'unikalnych użytkowników' },
  { eyebrow: 'Śr. czas zaangażowania', icon: 'i-lucide-timer', value: formatEngagement(props.avgEngagementMs), hint: 'na wyświetlenie' },
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
