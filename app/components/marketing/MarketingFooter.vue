<script setup lang="ts">
// Shared marketing footer (landing + docs). Year is a literal — no Date.now().
</script>

<template>
  <footer style="border-top: 1px solid var(--hairline)">
    <div class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-10 sm:flex-row sm:px-8">
      <div class="flex items-center gap-2.5">
        <img src="/logo.png" alt="" class="size-7 shrink-0 object-contain">
        <span class="text-sm" style="color: var(--body)">{{ $t('landing.footer.tagline') }}</span>
      </div>
      <nav class="flex items-center gap-5 text-sm" style="color: var(--muted)">
        <NuxtLink to="/docs" class="transition-colors hover:text-[var(--ink)]">{{ $t('landing.footer.docs') }}</NuxtLink>
        <NuxtLink to="/login" class="transition-colors hover:text-[var(--ink)]">{{ $t('landing.footer.login') }}</NuxtLink>
        <NuxtLink to="/register" class="transition-colors hover:text-[var(--ink)]">{{ $t('landing.footer.register') }}</NuxtLink>
      </nav>
      <p class="text-xs" style="color: var(--muted-soft)">© 2026 Shoot SEO — {{ $t('landing.footer.rights') }}</p>
    </div>
  </footer>
</template>
