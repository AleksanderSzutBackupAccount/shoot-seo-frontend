<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const { workspaces, current, switchTo } = useWorkspace()

const items = computed<DropdownMenuItem[][]>(() => [
  workspaces.value.map(w => ({
    label: w.name,
    icon: 'i-lucide-building-2',
    trailingIcon: w.id === current.value?.id ? 'i-lucide-check' : undefined,
    onSelect: () => switchTo(w.id),
  })),
  [{ label: 'Nowy workspace', icon: 'i-lucide-plus', to: '/workspaces/new' }],
])
</script>

<template>
  <UDropdownMenu :items="items" :ui="{ content: 'w-60' }">
    <button
      type="button"
      class="flex max-w-56 items-center gap-2 rounded-full py-1.5 pl-2.5 pr-2 transition-colors hover:bg-[var(--surface-strong)]"
    >
      <UIcon name="i-lucide-building-2" class="size-4 shrink-0" style="color: var(--muted)" />
      <span class="truncate text-sm" style="color: var(--ink); font-weight: 500">{{ current?.name ?? 'Wybierz workspace' }}</span>
      <UIcon name="i-lucide-chevrons-up-down" class="size-4 shrink-0" style="color: var(--muted)" />
    </button>
  </UDropdownMenu>
</template>
