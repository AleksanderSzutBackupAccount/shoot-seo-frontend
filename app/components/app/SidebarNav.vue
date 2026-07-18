<script setup lang="ts">
const route = useRoute()
const emit = defineEmits<{ navigate: [] }>()

const groups = [
  { labelKey: null, items: [{ labelKey: 'nav.dashboard', icon: 'i-lucide-layout-dashboard', to: '/dashboard' }] },
  {
    labelKey: 'nav.groupContent',
    items: [
      { labelKey: 'nav.posts', icon: 'i-lucide-file-text', to: '/posts' },
      { labelKey: 'nav.calendar', icon: 'i-lucide-calendar-days', to: '/calendar' },
      { labelKey: 'nav.media', icon: 'i-lucide-image', to: '/media' },
      { labelKey: 'nav.analytics', icon: 'i-lucide-chart-line', to: '/analytics' },
      { labelKey: 'nav.autonomous', icon: 'i-lucide-bot', to: '/autonomous' },
    ],
  },
  { labelKey: 'nav.groupTeam', items: [{ labelKey: 'nav.members', icon: 'i-lucide-users', to: '/members' }] },
  { labelKey: 'nav.groupSettings', items: [{ labelKey: 'nav.apiWebhooks', icon: 'i-lucide-settings', to: '/settings/api-keys', match: '/settings' }] },
]

function isActive(item: { to: string, match?: string }) {
  const base = item.match ?? item.to
  return route.path === base || route.path.startsWith(`${base}/`)
}
</script>

<template>
  <nav class="flex flex-col gap-7">
    <div v-for="(g, i) in groups" :key="i" class="flex flex-col gap-1">
      <p v-if="g.labelKey" class="eyebrow mb-1 px-3">{{ $t(g.labelKey) }}</p>
      <NuxtLink
        v-for="item in g.items"
        :key="item.to"
        :to="item.to"
        class="nav-link"
        :class="{ 'nav-link--active': isActive(item) }"
        @click="emit('navigate')"
      >
        <UIcon :name="item.icon" class="size-[18px] shrink-0" />
        <span>{{ $t(item.labelKey) }}</span>
      </NuxtLink>
    </div>
  </nav>
</template>

<style scoped>
.nav-link {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.55rem 0.75rem;
  border-radius: 11px;
  color: var(--muted);
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 0.01em;
  transition: background 0.18s ease, color 0.18s ease;
}
.nav-link:hover {
  background: var(--surface-strong);
  color: var(--ink);
}
.nav-link--active {
  background: var(--surface-strong);
  color: var(--ink);
}
</style>
