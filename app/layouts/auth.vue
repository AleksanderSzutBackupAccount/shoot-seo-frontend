<template>
  <div class="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
    <!-- Brand / editorial column -->
    <aside
      class="relative hidden flex-col justify-between overflow-hidden p-12 lg:flex xl:p-16"
      style="background: var(--canvas-soft)"
    >
      <AppGradientOrbs variant="hero" />

      <div class="relative z-10 flex items-center gap-2.5">
        <span
          class="flex size-8 items-center justify-center rounded-lg"
          style="background: var(--ink)"
        >
          <UIcon name="i-lucide-search-check" class="size-5" style="color: var(--on-primary)" />
        </span>
        <span class="text-lg tracking-tight" style="color: var(--ink); font-weight: 600">Shoot SEO</span>
      </div>

      <div class="relative z-10 max-w-lg">
        <p class="eyebrow mb-5">Content · SEO · AI</p>
        <h1 class="display-1">
          Treść, która<br>pozycjonuje się<br>sama.
        </h1>
        <p class="lede mt-6 max-w-md">
          Twórz, planuj i publikuj treści SEO w jednym miejscu — z asystą AI,
          własną analityką i integracjami. Wielotenantowo, dla całego zespołu.
        </p>
      </div>

      <div class="relative z-10 flex items-center gap-6 text-sm" style="color: var(--muted)">
        <span>Workspace'y i role</span>
        <span style="color: var(--hairline-strong)">·</span>
        <span>Planer publikacji</span>
        <span style="color: var(--hairline-strong)">·</span>
        <span>Headless API</span>
      </div>
    </aside>

    <!-- Form column -->
    <main class="relative flex flex-col items-center justify-center p-6 sm:p-10" style="background: var(--canvas)">
      <div class="mb-8 flex items-center gap-2 lg:hidden">
        <span class="flex size-7 items-center justify-center rounded-lg" style="background: var(--ink)">
          <UIcon name="i-lucide-search-check" class="size-4" style="color: var(--on-primary)" />
        </span>
        <span class="tracking-tight" style="color: var(--ink); font-weight: 600">Shoot SEO</span>
      </div>

      <div class="w-full max-w-[26rem]">
        <slot />
      </div>
    </main>
  </div>
</template>
