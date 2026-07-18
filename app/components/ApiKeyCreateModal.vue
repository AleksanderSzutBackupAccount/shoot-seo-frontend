<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import * as z from 'zod'
import type { ApiKey } from '~~/shared/types/api'

const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ created: [] }>()

const { create } = useApiKeys()
const { t } = useI18n()

// Known scopes for the read-only public v1 API. Optional — an empty selection
// lets the backend apply its default access.
const SCOPES = computed<{ value: string, hint: string }[]>(() => [
  { value: 'posts:read', hint: t('settings.apiKeys.scopePostsReadHint') },
])

const schema = z.object({
  name: z.string().min(1, t('settings.apiKeys.nameRequired')),
})
type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({ name: '' })
const selectedScopes = ref<string[]>(['posts:read'])
const form = useTemplateRef('form')
const loading = ref(false)
const serverError = ref<string | null>(null)

// Reveal-once state — the plaintext key lives here only while the modal is open.
const createdKey = ref<ApiKey | null>(null)
const plaintext = ref<string | null>(null)

const title = computed(() => (createdKey.value ? t('settings.apiKeys.createdTitle') : t('settings.apiKeys.createTitle')))
const description = computed(() =>
  createdKey.value
    ? t('settings.apiKeys.createdDescription')
    : t('settings.apiKeys.createDescription'))

function reset() {
  state.name = ''
  selectedScopes.value = ['posts:read']
  serverError.value = null
  createdKey.value = null
  plaintext.value = null
}

watch(open, (isOpen) => {
  if (isOpen) reset()
})

function toggleScope(value: string, checked: boolean) {
  const set = new Set(selectedScopes.value)
  if (checked) set.add(value)
  else set.delete(value)
  selectedScopes.value = [...set]
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true
  serverError.value = null
  try {
    const res = await create(event.data.name, selectedScopes.value)
    createdKey.value = res.key
    plaintext.value = res.plaintext
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
      <div v-if="createdKey && plaintext" class="space-y-4">
        <div class="flex items-center gap-3">
          <div class="surface-strong flex size-9 shrink-0 items-center justify-center rounded-lg">
            <UIcon name="i-lucide-key-round" class="size-4" style="color: var(--ink)" />
          </div>
          <div class="min-w-0">
            <p class="truncate text-sm" style="color: var(--ink); font-weight: 500">{{ createdKey.name }}</p>
            <p class="text-xs" style="color: var(--muted)">{{ $t('settings.apiKeys.createdJustNow') }}</p>
          </div>
        </div>
        <RevealSecret :value="plaintext" :label="$t('settings.apiKeys.secretLabel')" />
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
          <UFormField :label="$t('settings.apiKeys.colName')" name="name" :help="$t('settings.apiKeys.nameHelp')">
            <UInput v-model="state.name" :placeholder="$t('settings.apiKeys.namePlaceholder')" icon="i-lucide-tag" size="lg" class="w-full" />
          </UFormField>

          <UFormField :label="$t('settings.apiKeys.colScopes')" name="scopes" :help="$t('settings.apiKeys.scopesHelp')">
            <div class="flex flex-col gap-3">
              <UCheckbox
                v-for="scope in SCOPES"
                :key="scope.value"
                :model-value="selectedScopes.includes(scope.value)"
                :label="scope.value"
                :description="scope.hint"
                :ui="{ label: 'font-mono' }"
                @update:model-value="(value: boolean | 'indeterminate') => toggleScope(scope.value, value === true)"
              />
            </div>
          </UFormField>
        </UForm>
      </div>
    </template>

    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <template v-if="createdKey">
          <UButton color="neutral" icon="i-lucide-check" @click="open = false">{{ $t('common.done') }}</UButton>
        </template>
        <template v-else>
          <UButton color="neutral" variant="ghost" @click="open = false">{{ $t('common.cancel') }}</UButton>
          <UButton color="neutral" :loading="loading" icon="i-lucide-plus" @click="form?.submit()">{{ $t('settings.apiKeys.create') }}</UButton>
        </template>
      </div>
    </template>
  </UModal>
</template>
