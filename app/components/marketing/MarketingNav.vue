<script setup lang="ts">
// Public marketing top nav. Sticky + translucent, mirroring the app header chrome.
</script>

<template>
  <header
    class="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 px-5 sm:px-8"
    style="background: color-mix(in srgb, var(--canvas) 82%, transparent); backdrop-filter: blur(12px); border-bottom: 1px solid var(--hairline)"
  >
    <NuxtLink to="/" class="flex items-center gap-2.5">
      <img src="/logo.png" alt="" class="size-8 shrink-0 object-contain">
      <span class="tracking-tight" style="color: var(--ink); font-weight: 600">Shoot SEO</span>
    </NuxtLink>

    <nav class="flex items-center gap-1.5 sm:gap-2.5">
      <NuxtLink
        to="/docs"
        class="hidden rounded-full px-3 py-1.5 text-sm transition-colors hover:bg-[var(--surface-strong)] sm:inline-block"
        style="color: var(--body)"
      >
        {{ $t('landing.nav.docs') }}
      </NuxtLink>
      <AppLanguageSwitcher />
      <UColorModeButton />
      <UButton to="/login" color="neutral" variant="ghost" class="hidden sm:inline-flex">
        {{ $t('landing.nav.login') }}
      </UButton>
      <UButton to="/register" color="neutral">
        {{ $t('landing.nav.startFree') }}
      </UButton>
    </nav>
  </header>
</template>
