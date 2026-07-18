<template>
  <div class="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
    <!-- Brand / editorial column -->
    <aside
      class="relative hidden flex-col justify-between overflow-hidden p-12 lg:flex xl:p-16"
      style="background: var(--canvas-soft)"
    >
      <AppGradientOrbs variant="hero" />

      <div class="relative z-10 flex items-center justify-between gap-2.5">
        <div class="flex items-center gap-2.5">
          <img src="/logo.png" alt="" class="size-8 shrink-0 object-contain">
          <span class="text-lg tracking-tight" style="color: var(--ink); font-weight: 600">Shoot SEO</span>
        </div>
        <AppLanguageSwitcher />
      </div>

      <div class="relative z-10 max-w-lg">
        <p class="eyebrow mb-5">{{ $t('auth.tagline') }}</p>
        <h1 class="display-1">
          {{ $t('auth.headlineLine1') }}<br>{{ $t('auth.headlineLine2') }}<br>{{ $t('auth.headlineLine3') }}
        </h1>
        <p class="lede mt-6 max-w-md">
          {{ $t('auth.lede') }}
        </p>
      </div>

      <div class="relative z-10 flex items-center gap-6 text-sm" style="color: var(--muted)">
        <span>{{ $t('auth.featureWorkspaces') }}</span>
        <span style="color: var(--hairline-strong)">·</span>
        <span>{{ $t('auth.featureScheduler') }}</span>
        <span style="color: var(--hairline-strong)">·</span>
        <span>{{ $t('auth.featureApi') }}</span>
      </div>
    </aside>

    <!-- Form column -->
    <main class="relative flex flex-col items-center justify-center p-6 sm:p-10" style="background: var(--canvas)">
      <div class="mb-8 flex w-full max-w-[26rem] items-center justify-between gap-2 lg:hidden">
        <div class="flex items-center gap-2">
          <img src="/logo.png" alt="" class="size-7 shrink-0 object-contain">
          <span class="tracking-tight" style="color: var(--ink); font-weight: 600">Shoot SEO</span>
        </div>
        <AppLanguageSwitcher />
      </div>

      <div class="w-full max-w-[26rem]">
        <slot />
      </div>
    </main>
  </div>
</template>
