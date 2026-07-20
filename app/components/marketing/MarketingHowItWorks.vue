<script setup lang="ts">
// Three numbered steps. `scroll-margin-top` clears the sticky nav when the
// hero's "See how it works" CTA jumps to #how.
const steps = [
  { title: 'landing.how.step1Title', body: 'landing.how.step1Body' },
  { title: 'landing.how.step2Title', body: 'landing.how.step2Body' },
  { title: 'landing.how.step3Title', body: 'landing.how.step3Body' },
]
</script>

<template>
  <section id="how" class="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24" style="scroll-margin-top: 5rem">
    <div class="mx-auto max-w-2xl text-center">
      <p class="eyebrow">{{ $t('landing.how.eyebrow') }}</p>
      <h2 class="display-2 mt-4">{{ $t('landing.how.title') }}</h2>
    </div>
    <ol class="mt-12 grid gap-8 sm:grid-cols-3">
      <li v-for="(s, i) in steps" :key="i" class="text-center sm:text-left">
        <span class="font-display text-4xl" style="color: var(--muted-soft)">0{{ i + 1 }}</span>
        <h3 class="mt-3 text-lg tracking-tight" style="color: var(--ink); font-weight: 600">{{ $t(s.title) }}</h3>
        <p class="mt-2 text-sm" style="color: var(--body)">{{ $t(s.body) }}</p>
      </li>
    </ol>
  </section>
</template>
