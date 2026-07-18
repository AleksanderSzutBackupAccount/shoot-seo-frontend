<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import * as z from 'zod'
import type { Webhook } from '~~/shared/types/api'

const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ created: [] }>()

const { create } = useWebhooks()
const { t } = useI18n()

const EVENTS = computed<{ value: string, hint: string }[]>(() => [
  { value: 'post.published', hint: t('settings.webhooks.eventPublishedHint') },
  { value: 'post.unpublished', hint: t('settings.webhooks.eventUnpublishedHint') },
])

const schema = z.object({
  url: z.string().url(t('common.invalidUrl')),
})
type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({ url: '' })
const selectedEvents = ref<string[]>(['post.published'])
const eventsError = ref<string | null>(null)
const form = useTemplateRef('form')
const loading = ref(false)
const serverError = ref<string | null>(null)

// Reveal-once state — the signing secret lives here only while the modal is open.
const createdWebhook = ref<Webhook | null>(null)
const secret = ref<string | null>(null)

const title = computed(() => (createdWebhook.value ? t('settings.webhooks.createdTitle') : t('settings.webhooks.createTitle')))
const description = computed(() =>
  createdWebhook.value
    ? t('settings.webhooks.createdDescription')
    : t('settings.webhooks.createDescription'))

function reset() {
  state.url = ''
  selectedEvents.value = ['post.published']
  eventsError.value = null
  serverError.value = null
  createdWebhook.value = null
  secret.value = null
}

watch(open, (isOpen) => {
  if (isOpen) reset()
})

function toggleEvent(value: string, checked: boolean) {
  const set = new Set(selectedEvents.value)
  if (checked) set.add(value)
  else set.delete(value)
  selectedEvents.value = [...set]
  if (selectedEvents.value.length) eventsError.value = null
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  if (!selectedEvents.value.length) {
    eventsError.value = t('settings.webhooks.eventsRequired')
    return
  }
  loading.value = true
  serverError.value = null
  try {
    const res = await create(event.data.url, selectedEvents.value)
    createdWebhook.value = res.webhook
    secret.value = res.secret
    emit('created')
  }
  catch (err) {
    const { message, fieldErrors } = parseApiError(err)
    serverError.value = message
    if (fieldErrors.length) form.value?.setErrors(fieldErrors)
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <UModal v-model:open="open" :title="title" :description="description">
    <template #body>
      <!-- Reveal-once view -->
      <div v-if="createdWebhook && secret" class="space-y-4">
        <div class="flex items-center gap-3">
          <div class="surface-strong flex size-9 shrink-0 items-center justify-center rounded-lg">
            <UIcon name="i-lucide-webhook" class="size-4" style="color: var(--ink)" />
          </div>
          <p class="min-w-0 truncate font-mono text-sm" style="color: var(--ink)">{{ createdWebhook.url }}</p>
        </div>
        <RevealSecret :value="secret" :label="$t('settings.webhooks.secretLabel')" />
      </div>

      <!-- Create form -->
      <div v-else>
        <UAlert
          v-if="serverError"
          color="error"
          variant="subtle"
          icon="i-lucide-triangle-alert"
          :title="serverError"
          class="mb-5"
        />

        <UForm ref="form" :schema="schema" :state="state" class="space-y-5" @submit="onSubmit">
          <UFormField :label="$t('common.urlLabel')" name="url" :help="$t('settings.webhooks.urlHelp')">
            <UInput v-model="state.url" type="url" :placeholder="$t('settings.webhooks.urlPlaceholder')" icon="i-lucide-link" size="lg" class="w-full" />
          </UFormField>

          <UFormField :label="$t('settings.webhooks.colEvents')" name="events" :error="eventsError ?? undefined">
            <div class="flex flex-col gap-3">
              <UCheckbox
                v-for="ev in EVENTS"
                :key="ev.value"
                :model-value="selectedEvents.includes(ev.value)"
                :label="ev.value"
                :description="ev.hint"
                :ui="{ label: 'font-mono' }"
                @update:model-value="(value: boolean | 'indeterminate') => toggleEvent(ev.value, value === true)"
              />
            </div>
          </UFormField>
        </UForm>
      </div>
    </template>

    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <template v-if="createdWebhook">
          <UButton color="neutral" icon="i-lucide-check" @click="open = false">{{ $t('common.done') }}</UButton>
        </template>
        <template v-else>
          <UButton color="neutral" variant="ghost" @click="open = false">{{ $t('common.cancel') }}</UButton>
          <UButton color="neutral" :loading="loading" icon="i-lucide-plus" @click="form?.submit()">{{ $t('settings.webhooks.create') }}</UButton>
        </template>
      </div>
    </template>
  </UModal>
</template>
