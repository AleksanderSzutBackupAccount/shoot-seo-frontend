<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const { user, logout, isEmailVerified } = useAuth()
const mobileNav = ref(false)

const userMenu = computed<DropdownMenuItem[][]>(() => [
  [{ label: user.value?.name ?? 'Konto', type: 'label' }],
  [{ label: 'Weryfikacja e-mail', icon: 'i-lucide-mail-check', to: '/verify-email' }],
  [{ label: 'Wyloguj', icon: 'i-lucide-log-out', color: 'error', onSelect: () => logout() }],
])
</script>

<template>
  <div class="flex min-h-screen" style="background: var(--canvas)">
    <!-- Sidebar (desktop) -->
    <aside
      class="sticky top-0 hidden h-screen w-[264px] shrink-0 flex-col md:flex"
      style="background: var(--canvas-soft); border-right: 1px solid var(--hairline)"
    >
      <div class="flex h-16 items-center gap-2.5 px-6">
        <img src="/logo.png" alt="" class="size-8 shrink-0 object-contain">
        <span class="tracking-tight" style="color: var(--ink); font-weight: 600">Shoot SEO</span>
      </div>

      <div class="flex-1 overflow-y-auto px-4 py-6">
        <AppSidebarNav />
      </div>

      <div class="px-6 py-5" style="border-top: 1px solid var(--hairline)">
        <p class="eyebrow">Milestone</p>
        <p class="mt-1 text-sm" style="color: var(--body)">Content &amp; Planer · M1</p>
      </div>
    </aside>

    <!-- Main column -->
    <div class="flex min-w-0 flex-1 flex-col">
      <header
        class="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 px-4 sm:px-6"
        style="background: color-mix(in srgb, var(--canvas) 82%, transparent); backdrop-filter: blur(12px); border-bottom: 1px solid var(--hairline)"
      >
        <div class="flex items-center gap-2">
          <UButton
            icon="i-lucide-menu"
            color="neutral"
            variant="ghost"
            class="md:hidden"
            aria-label="Menu"
            @click="mobileNav = true"
          />
          <AppWorkspaceSwitcher />
        </div>

        <div class="flex items-center gap-1.5">
          <UColorModeButton />
          <UDropdownMenu :items="userMenu" :ui="{ content: 'w-56' }">
            <button class="flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 transition-colors hover:bg-[var(--surface-strong)]">
              <UAvatar :alt="user?.name" size="sm" icon="i-lucide-user" />
              <span class="hidden text-sm sm:inline" style="color: var(--ink)">{{ user?.name }}</span>
              <UIcon name="i-lucide-chevron-down" class="size-4" style="color: var(--muted)" />
            </button>
          </UDropdownMenu>
        </div>
      </header>

      <div v-if="user && !isEmailVerified" class="px-4 pt-4 sm:px-8">
        <div
          class="mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-xl px-4 py-3"
          style="background: var(--surface-strong)"
        >
          <div class="flex items-center gap-2.5 text-sm" style="color: var(--body)">
            <UIcon name="i-lucide-mail-warning" class="size-4 shrink-0" style="color: var(--ink)" />
            <span>Potwierdź swój adres e-mail, aby odblokować wszystkie funkcje.</span>
          </div>
          <UButton to="/verify-email" size="xs" color="neutral" class="shrink-0">Weryfikuj</UButton>
        </div>
      </div>

      <main class="flex-1">
        <div class="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
          <slot />
        </div>
      </main>
    </div>

    <!-- Mobile nav -->
    <USlideover v-model:open="mobileNav" side="left" title="Shoot SEO">
      <template #body>
        <AppSidebarNav @navigate="mobileNav = false" />
      </template>
    </USlideover>
  </div>
</template>
