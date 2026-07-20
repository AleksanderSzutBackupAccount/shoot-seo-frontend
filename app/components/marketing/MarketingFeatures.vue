<script setup lang="ts">
// Four capability cards. Titles/bodies are i18n keys resolved in the template.
const features = [
  { icon: 'i-lucide-sparkles', title: 'landing.features.aiTitle', body: 'landing.features.aiBody' },
  { icon: 'i-lucide-calendar-clock', title: 'landing.features.schedulerTitle', body: 'landing.features.schedulerBody' },
  { icon: 'i-lucide-bar-chart-3', title: 'landing.features.analyticsTitle', body: 'landing.features.analyticsBody' },
  { icon: 'i-lucide-code-xml', title: 'landing.features.apiTitle', body: 'landing.features.apiBody' },
]
</script>

<template>
  <section class="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
    <div class="mx-auto max-w-2xl text-center">
      <p class="eyebrow">{{ $t('landing.features.eyebrow') }}</p>
      <h2 class="display-2 mt-4">{{ $t('landing.features.title') }}</h2>
    </div>
    <div class="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <article v-for="f in features" :key="f.icon" class="u-card u-card--hover p-6">
        <div class="flex size-11 items-center justify-center rounded-xl" style="background: var(--surface-strong)">
          <UIcon :name="f.icon" class="size-5" style="color: var(--ink)" />
        </div>
        <h3 class="card-title mt-5" style="font-size: 1.125rem">{{ $t(f.title) }}</h3>
        <p class="mt-2 text-sm" style="color: var(--body)">{{ $t(f.body) }}</p>
      </article>
    </div>
  </section>
</template>
