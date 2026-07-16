<script setup lang="ts">
const route = useRoute()

const tabs = [
  { label: 'Klucze API', icon: 'i-lucide-key-round', to: '/settings/api-keys' },
  { label: 'Webhooki', icon: 'i-lucide-webhook', to: '/settings/webhooks' },
  { label: 'Kanały', icon: 'i-lucide-share-2', to: '/settings/channels' },
  { label: 'Plan i płatności', icon: 'i-lucide-credit-card', to: '/settings/billing' },
]

function isActive(to: string) {
  return route.path === to || route.path.startsWith(`${to}/`)
}
</script>

<template>
  <div class="mb-8 flex flex-wrap gap-1.5">
    <NuxtLink
      v-for="tab in tabs"
      :key="tab.to"
      :to="tab.to"
      class="settings-tab"
      :class="{ 'settings-tab--active': isActive(tab.to) }"
    >
      <UIcon :name="tab.icon" class="size-4 shrink-0" />
      <span>{{ tab.label }}</span>
    </NuxtLink>
  </div>
</template>

<style scoped>
.settings-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.5rem 0.95rem;
  border-radius: 9999px;
  border: 1px solid var(--hairline);
  color: var(--muted);
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.01em;
  transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease;
}
.settings-tab:hover {
  background: var(--surface-strong);
  color: var(--ink);
  border-color: var(--hairline-strong);
}
.settings-tab--active {
  background: var(--ink);
  color: var(--on-primary);
  border-color: var(--ink);
}
.settings-tab--active:hover {
  background: var(--ink);
  color: var(--on-primary);
}
</style>
