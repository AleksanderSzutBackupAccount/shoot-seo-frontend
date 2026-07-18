<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { ApiKey } from '~~/shared/types/api'

const { t, locale } = useI18n()
useHead({ title: () => t('settings.apiKeys.pageTitle') })

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

const columns = computed<TableColumn<ApiKey>[]>(() => [
  { accessorKey: 'name', header: t('settings.apiKeys.colName') },
  { id: 'prefix', header: t('settings.apiKeys.colKey') },
  { id: 'scopes', header: t('settings.apiKeys.colScopes') },
  { accessorKey: 'last_used_at', header: t('settings.apiKeys.colLastUsed') },
  { accessorKey: 'created_at', header: t('settings.apiKeys.colCreated') },
  { id: 'actions', header: '' },
])

function formatDate(value: string | null): string {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(locale.value, { dateStyle: 'medium' })
}

async function confirmRevoke() {
  if (!revokeTarget.value) return
  revoking.value = true
  try {
    await revoke(revokeTarget.value.id)
    toast.add({ title: t('settings.apiKeys.toastRevoked'), color: 'success' })
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
      :eyebrow="$t('nav.groupSettings')"
      :title="$t('shell.settingsApiKeys')"
      :description="$t('settings.apiKeys.description')"
    >
      <template #actions>
        <UButton color="neutral" icon="i-lucide-plus" size="lg" @click="createOpen = true">
          {{ $t('settings.apiKeys.create') }}
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
      :title="$t('settings.apiKeys.emptyTitle')"
      :description="$t('settings.apiKeys.emptyDescription')"
    >
      <template #action>
        <UButton color="neutral" icon="i-lucide-plus" @click="createOpen = true">{{ $t('settings.apiKeys.create') }}</UButton>
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
            {{ row.original.last_used_at ? formatDate(row.original.last_used_at) : $t('settings.apiKeys.never') }}
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
              :aria-label="$t('settings.apiKeys.revokeAria')"
              @click="revokeTarget = row.original"
            />
          </div>
        </template>
      </UTable>
    </div>

    <ApiKeyCreateModal v-model:open="createOpen" @created="refresh" />

    <UModal
      :open="revokeTarget !== null"
      :title="$t('settings.apiKeys.revokeModalTitle')"
      :description="$t('settings.apiKeys.revokeModalDescription', { name: revokeTarget?.name ?? '' })"
      @update:open="(value: boolean) => { if (!value) revokeTarget = null }"
    >
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton color="neutral" variant="ghost" @click="revokeTarget = null">{{ $t('common.cancel') }}</UButton>
          <UButton color="error" :loading="revoking" @click="confirmRevoke">{{ $t('settings.apiKeys.revoke') }}</UButton>
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
