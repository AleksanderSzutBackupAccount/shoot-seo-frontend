<script setup lang="ts">
defineProps<{ eyebrow?: string, title: string, description?: string }>()
</script>

<template>
  <div class="mb-8 flex flex-col gap-5 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
    <div class="max-w-2xl">
      <p v-if="eyebrow" class="eyebrow mb-3">{{ eyebrow }}</p>
      <h1 class="page-title">{{ title }}</h1>
      <p v-if="description" class="lede mt-3">{{ description }}</p>
    </div>
    <div v-if="$slots.actions" class="flex shrink-0 items-center gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>
