<script setup lang="ts">
const { isTrialing, trialDaysLeft } = usePlan()
</script>

<template>
  <NuxtLink
    v-if="isTrialing"
    to="/settings/billing"
    class="hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium sm:inline-flex"
    style="background: var(--surface-strong); color: var(--ink)"
  >
    <UIcon name="i-lucide-sparkles" class="size-3.5" />
    {{ $t('trial.pill', { days: trialDaysLeft ?? 0 }) }}
  </NuxtLink>
</template>
