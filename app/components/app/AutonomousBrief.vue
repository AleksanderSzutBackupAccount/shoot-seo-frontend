<script setup lang="ts">
import type { AutonomousBrief } from '~~/shared/types/api'

// Read-only display of a site's distilled brief (summary, keyword chips, tone).
defineProps<{ brief: AutonomousBrief }>()
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-center gap-2">
      <span class="eyebrow">{{ $t('autonomous.toneLabel') }}</span>
      <span class="badge-pill">{{ brief.tone }}</span>
    </div>
    <p class="text-sm leading-relaxed" style="color: var(--body)">{{ brief.summary }}</p>
    <div v-if="brief.keywords.length" class="flex flex-wrap gap-2">
      <span v-for="kw in brief.keywords" :key="kw" class="chip">{{ kw }}</span>
    </div>
  </div>
</template>
