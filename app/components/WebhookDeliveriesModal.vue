<script setup lang="ts">
import type { Webhook, WebhookDelivery } from '~~/shared/types/api'

const props = defineProps<{ webhook: Webhook | null }>()
const emit = defineEmits<{ close: [] }>()

const { deliveries } = useWebhooks()
const toast = useToast()

const rows = ref<WebhookDelivery[]>([])
const loading = ref(false)

const isOpen = computed({
  get: () => props.webhook !== null,
  set: (value: boolean) => {
    if (!value) emit('close')
  },
})

watch(() => props.webhook, async (webhook) => {
  if (!webhook) return
  loading.value = true
  rows.value = []
  try {
    rows.value = await deliveries(webhook.id)
  }
  catch (err) {
    toast.add({ title: parseApiError(err).message, color: 'error' })
  }
  finally {
    loading.value = false
  }
})

function formatDate(value: string | null): string {
  if (!value) return '—'
  return new Date(value).toLocaleString('pl-PL', { dateStyle: 'medium', timeStyle: 'short' })
}

function statusMeta(delivery: WebhookDelivery): { label: string, cls: string } {
  if (delivery.response_status === null) return { label: 'Oczekuje', cls: 'chip--draft' }
  if (delivery.response_status >= 200 && delivery.response_status < 300) {
    return { label: String(delivery.response_status), cls: 'chip--published' }
  }
  return { label: String(delivery.response_status), cls: 'chip--fail' }
}

function attemptsLabel(n: number): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (n === 1) return 'próba'
  if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) return 'próby'
  return 'prób'
}
</script>

<template>
  <UModal
    v-model:open="isOpen"
    title="Dostawy webhooka"
    :description="webhook?.url"
    :ui="{ content: 'sm:max-w-lg' }"
  >
    <template #body>
      <div v-if="loading" class="flex justify-center py-12">
        <UIcon name="i-lucide-loader-circle" class="size-7 animate-spin" style="color: var(--muted)" />
      </div>

      <div v-else-if="rows.length === 0" class="py-12 text-center">
        <div class="surface-strong mx-auto mb-3 flex size-11 items-center justify-center rounded-full">
          <UIcon name="i-lucide-inbox" class="size-5" style="color: var(--muted)" />
        </div>
        <p class="card-title" style="font-size: 1.15rem">Brak dostaw</p>
        <p class="mx-auto mt-1.5 max-w-xs text-sm" style="color: var(--muted)">
          Zdarzenia pojawią się tutaj, gdy webhook zacznie odbierać publikacje.
        </p>
      </div>

      <div v-else>
        <div
          v-for="delivery in rows"
          :key="delivery.id"
          class="flex items-center justify-between gap-3 py-3"
          style="border-top: 1px solid var(--hairline-soft)"
        >
          <div class="min-w-0">
            <p class="truncate font-mono text-sm" style="color: var(--ink)">{{ delivery.event }}</p>
            <p class="mt-0.5 text-xs" style="color: var(--muted)">
              {{ formatDate(delivery.delivered_at ?? delivery.created_at) }}
              · {{ delivery.attempts }} {{ attemptsLabel(delivery.attempts) }}
            </p>
          </div>
          <span class="chip shrink-0" :class="statusMeta(delivery).cls">{{ statusMeta(delivery).label }}</span>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex w-full justify-end">
        <UButton color="neutral" variant="ghost" @click="emit('close')">Zamknij</UButton>
      </div>
    </template>
  </UModal>
</template>

<style scoped>
/* Failure status chip — rose tint from the palette (matches the chip family). */
.chip--fail {
  background: color-mix(in srgb, var(--orb-rose) 46%, transparent);
  color: #9f1239;
}
.dark .chip--fail {
  color: #f4a8bc;
}
</style>
