<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Webhook } from '~~/shared/types/api'

useHead({ title: 'Webhooki — Shoot SEO' })

const { current } = useWorkspace()
const { list, remove } = useWebhooks()
const toast = useToast()

const { data: webhooks, status, refresh } = await useAsyncData(
  'webhooks',
  () => list(),
  { watch: [() => current.value?.id], default: () => [] as Webhook[] },
)

const createOpen = ref(false)
const deliveriesTarget = ref<Webhook | null>(null)
const removeTarget = ref<Webhook | null>(null)
const removing = ref(false)

const columns: TableColumn<Webhook>[] = [
  { accessorKey: 'url', header: 'Adres URL' },
  { id: 'events', header: 'Zdarzenia' },
  { accessorKey: 'active', header: 'Status' },
  { id: 'actions', header: '' },
]

async function confirmRemove() {
  if (!removeTarget.value) return
  removing.value = true
  try {
    await remove(removeTarget.value.id)
    toast.add({ title: 'Webhook usunięty', color: 'success' })
    removeTarget.value = null
    await refresh()
  }
  catch (err) {
    toast.add({ title: parseApiError(err).message, color: 'error' })
  }
  finally {
    removing.value = false
  }
}
</script>

<template>
  <div>
    <AppPageHeader
      eyebrow="Ustawienia"
      title="Webhooki"
      description="Powiadamiaj zewnętrzne systemy o publikacjach — wysyłamy podpisane zdarzenia POST na Twój adres."
    >
      <template #actions>
        <UButton color="neutral" icon="i-lucide-plus" size="lg" @click="createOpen = true">
          Dodaj webhook
        </UButton>
      </template>
    </AppPageHeader>

    <SettingsTabs />

    <div v-if="status === 'pending'" class="flex justify-center py-20">
      <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin" style="color: var(--muted)" />
    </div>

    <AppEmptyState
      v-else-if="(webhooks?.length ?? 0) === 0"
      icon="i-lucide-webhook"
      title="Brak webhooków"
      description="Dodaj pierwszy webhook, aby otrzymywać zdarzenia o publikacjach. Sekret podpisu pokażemy tylko raz."
    >
      <template #action>
        <UButton color="neutral" icon="i-lucide-plus" @click="createOpen = true">Dodaj webhook</UButton>
      </template>
    </AppEmptyState>

    <div v-else class="u-card overflow-hidden">
      <UTable
        class="data-table"
        :data="webhooks ?? []"
        :columns="columns"
        :ui="{ tbody: 'divide-y divide-[var(--hairline-soft)]' }"
      >
        <template #url-cell="{ row }">
          <span class="block max-w-md truncate font-mono text-sm" style="color: var(--ink)">{{ row.original.url }}</span>
        </template>

        <template #events-cell="{ row }">
          <div class="flex flex-wrap gap-1.5">
            <span v-for="ev in row.original.events" :key="ev" class="token">{{ ev }}</span>
          </div>
        </template>

        <template #active-cell="{ row }">
          <span class="chip" :class="row.original.active ? 'chip--published' : 'chip--draft'">
            {{ row.original.active ? 'Aktywny' : 'Wstrzymany' }}
          </span>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex justify-end gap-1">
            <UButton
              icon="i-lucide-activity"
              color="neutral"
              variant="ghost"
              size="sm"
              @click="deliveriesTarget = row.original"
            >
              Dostawy
            </UButton>
            <UButton
              icon="i-lucide-trash-2"
              color="neutral"
              variant="ghost"
              size="sm"
              aria-label="Usuń webhook"
              @click="removeTarget = row.original"
            />
          </div>
        </template>
      </UTable>
    </div>

    <WebhookCreateModal v-model:open="createOpen" @created="refresh" />
    <WebhookDeliveriesModal :webhook="deliveriesTarget" @close="deliveriesTarget = null" />

    <UModal
      :open="removeTarget !== null"
      title="Usunąć webhook?"
      :description="`Przestaniemy wysyłać zdarzenia na ${removeTarget?.url}. Tej operacji nie można cofnąć.`"
      @update:open="(value: boolean) => { if (!value) removeTarget = null }"
    >
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton color="neutral" variant="ghost" @click="removeTarget = null">Anuluj</UButton>
          <UButton color="error" :loading="removing" @click="confirmRemove">Usuń</UButton>
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
</style>
