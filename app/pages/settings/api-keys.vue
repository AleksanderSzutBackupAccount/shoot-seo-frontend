<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { ApiKey } from '~~/shared/types/api'

useHead({ title: 'Klucze API — Shoot SEO' })

const { current } = useWorkspace()
const { list, revoke } = useApiKeys()
const toast = useToast()

const { data: keys, status, refresh } = await useAsyncData(
  'api-keys',
  () => list(),
  { watch: [() => current.value?.id], default: () => [] as ApiKey[] },
)

const createOpen = ref(false)
const revokeTarget = ref<ApiKey | null>(null)
const revoking = ref(false)

const columns: TableColumn<ApiKey>[] = [
  { accessorKey: 'name', header: 'Nazwa' },
  { id: 'prefix', header: 'Klucz' },
  { id: 'scopes', header: 'Zakresy' },
  { accessorKey: 'last_used_at', header: 'Ostatnie użycie' },
  { accessorKey: 'created_at', header: 'Utworzono' },
  { id: 'actions', header: '' },
]

function formatDate(value: string | null): string {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('pl-PL', { dateStyle: 'medium' })
}

async function confirmRevoke() {
  if (!revokeTarget.value) return
  revoking.value = true
  try {
    await revoke(revokeTarget.value.id)
    toast.add({ title: 'Klucz odwołany', color: 'success' })
    revokeTarget.value = null
    await refresh()
  }
  catch (err) {
    toast.add({ title: parseApiError(err).message, color: 'error' })
  }
  finally {
    revoking.value = false
  }
}
</script>

<template>
  <div>
    <AppPageHeader
      eyebrow="Ustawienia"
      title="Klucze API"
      description="Klucze dają stronie klienta headless dostęp do publicznego API opublikowanych treści."
    >
      <template #actions>
        <UButton color="neutral" icon="i-lucide-plus" size="lg" @click="createOpen = true">
          Utwórz klucz
        </UButton>
      </template>
    </AppPageHeader>

    <SettingsTabs />

    <div v-if="status === 'pending'" class="flex justify-center py-20">
      <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin" style="color: var(--muted)" />
    </div>

    <AppEmptyState
      v-else-if="(keys?.length ?? 0) === 0"
      icon="i-lucide-key-round"
      title="Brak kluczy API"
      description="Utwórz pierwszy klucz, aby udostępnić treści przez publiczne API. Pełny klucz pokażemy tylko raz."
    >
      <template #action>
        <UButton color="neutral" icon="i-lucide-plus" @click="createOpen = true">Utwórz klucz</UButton>
      </template>
    </AppEmptyState>

    <div v-else class="u-card overflow-hidden">
      <UTable
        class="data-table"
        :data="keys ?? []"
        :columns="columns"
        :ui="{ tbody: 'divide-y divide-[var(--hairline-soft)]' }"
      >
        <template #name-cell="{ row }">
          <span style="color: var(--ink); font-weight: 500">{{ row.original.name }}</span>
        </template>

        <template #prefix-cell="{ row }">
          <span class="token">{{ row.original.prefix }}<span class="token-dots">••••••</span></span>
        </template>

        <template #scopes-cell="{ row }">
          <div v-if="row.original.scopes.length" class="flex flex-wrap gap-1.5">
            <span v-for="scope in row.original.scopes" :key="scope" class="token">{{ scope }}</span>
          </div>
          <span v-else class="text-sm" style="color: var(--muted-soft)">—</span>
        </template>

        <template #last_used_at-cell="{ row }">
          <span class="text-sm" style="color: var(--muted)">
            {{ row.original.last_used_at ? formatDate(row.original.last_used_at) : 'Nigdy' }}
          </span>
        </template>

        <template #created_at-cell="{ row }">
          <span class="text-sm" style="color: var(--muted)">{{ formatDate(row.original.created_at) }}</span>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex justify-end">
            <UButton
              icon="i-lucide-trash-2"
              color="neutral"
              variant="ghost"
              size="sm"
              aria-label="Odwołaj klucz"
              @click="revokeTarget = row.original"
            />
          </div>
        </template>
      </UTable>
    </div>

    <ApiKeyCreateModal v-model:open="createOpen" @created="refresh" />

    <UModal
      :open="revokeTarget !== null"
      title="Odwołać klucz?"
      :description="`Klucz „${revokeTarget?.name}” przestanie działać natychmiast. Tej operacji nie można cofnąć.`"
      @update:open="(value: boolean) => { if (!value) revokeTarget = null }"
    >
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton color="neutral" variant="ghost" @click="revokeTarget = null">Anuluj</UButton>
          <UButton color="error" :loading="revoking" @click="confirmRevoke">Odwołaj</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<style scoped>
.data-table :deep(thead th) {
  padding: 0.85rem 1.25rem;
  text-align: left;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--muted);
  border-bottom: 1px solid var(--hairline);
}
.data-table :deep(tbody td) {
  padding: 0.85rem 1.25rem;
  vertical-align: middle;
  color: var(--body);
}
.data-table :deep(tbody tr) {
  transition: background-color 0.15s ease;
}
.data-table :deep(tbody tr:hover) {
  background: var(--surface-strong);
}
.token {
  display: inline-flex;
  align-items: center;
  padding: 0.15rem 0.5rem;
  border-radius: 7px;
  background: var(--surface-strong);
  border: 1px solid var(--hairline);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.78rem;
  color: var(--ink);
}
.token-dots {
  margin-left: 0.15rem;
  color: var(--muted-soft);
  letter-spacing: 0.05em;
}
</style>
