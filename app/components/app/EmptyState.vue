<script setup lang="ts">
defineProps<{ icon?: string, title: string, description?: string }>()
</script>

<template>
  <div class="u-card relative overflow-hidden px-6 py-16 text-center">
    <AppGradientOrbs variant="corner" />
    <div class="relative z-10 mx-auto flex max-w-md flex-col items-center gap-3">
      <div class="surface-strong flex size-12 items-center justify-center rounded-full">
        <UIcon :name="icon || 'i-lucide-sparkles'" class="size-5" style="color: var(--ink)" />
      </div>
      <h3 class="card-title">{{ title }}</h3>
      <p v-if="description" class="max-w-sm text-[15px]" style="color: var(--muted)">
        {{ description }}
      </p>
      <div v-if="$slots.action" class="mt-3">
        <slot name="action" />
      </div>
    </div>
  </div>
</template>
