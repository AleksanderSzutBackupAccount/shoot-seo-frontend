<script setup lang="ts">
// Closing conversion panel.
</script>

<template>
  <section class="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-16">
    <div class="relative overflow-hidden rounded-3xl px-8 py-16 text-center sm:px-16" style="background: var(--surface-strong)">
      <AppGradientOrbs variant="corner" />
      <div class="relative z-10 mx-auto max-w-xl">
        <h2 class="display-2">{{ $t('landing.cta.title') }}</h2>
        <p class="lede mt-4">{{ $t('landing.cta.body') }}</p>
        <UButton to="/register" size="lg" color="neutral" class="mt-8">{{ $t('landing.cta.button') }}</UButton>
      </div>
    </div>
  </section>
</template>
