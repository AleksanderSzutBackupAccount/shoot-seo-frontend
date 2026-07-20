<script setup lang="ts">
// Landing hero — the brand pun headline over atmospheric gradient orbs.
</script>

<template>
  <section class="relative overflow-hidden">
    <AppGradientOrbs variant="hero" />
    <div class="relative z-10 mx-auto max-w-4xl px-5 py-24 text-center sm:px-8 sm:py-32">
      <p class="eyebrow">{{ $t('landing.hero.eyebrow') }}</p>
      <h1 class="display-1 mx-auto mt-5 max-w-3xl">{{ $t('landing.hero.headline') }}</h1>
      <p class="lede mx-auto mt-6 max-w-xl">{{ $t('landing.hero.subline') }}</p>
      <div class="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <UButton to="/register" size="lg" color="neutral">{{ $t('landing.hero.ctaPrimary') }}</UButton>
        <UButton to="#how" size="lg" color="neutral" variant="ghost">{{ $t('landing.hero.ctaSecondary') }}</UButton>
      </div>
    </div>
  </section>
</template>
