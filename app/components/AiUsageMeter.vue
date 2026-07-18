<script setup lang="ts">
// Compact token-usage gauge for the AI content engine (M4). Reads the shared
// `useAi().usage` state so it stays in sync with every generate/improve/analyze call.
const { usage, fetchUsage } = useAi()
const { t } = useI18n()
onMounted(fetchUsage)

const percent = computed(() => {
  if (!usage.value || usage.value.tokens_limit === 0) return 0
  return Math.min(100, Math.round((usage.value.tokens_used / usage.value.tokens_limit) * 100))
})
</script>

<template>
  <div v-if="usage" class="flex items-center gap-2 text-sm">
    <span style="color: var(--muted)">{{ t('settings.billing.aiUsageLabel', { used: usage.tokens_used.toLocaleString(), limit: usage.tokens_limit.toLocaleString() }) }}</span>
    <UProgress :model-value="percent" :max="100" class="w-24" />
  </div>
</template>
