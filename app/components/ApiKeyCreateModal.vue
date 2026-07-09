<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import * as z from 'zod'
import type { ApiKey } from '~~/shared/types/api'

const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ created: [] }>()

const { create } = useApiKeys()

// Known scopes for the read-only public v1 API. Optional — an empty selection
// lets the backend apply its default access.
const SCOPES: { value: string, hint: string }[] = [
  { value: 'posts:read', hint: 'Odczyt opublikowanych treści przez publiczne API.' },
]

const schema = z.object({
  name: z.string().min(1, 'Podaj nazwę klucza'),
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

const title = computed(() => (createdKey.value ? 'Klucz utworzony' : 'Nowy klucz API'))
const description = computed(() =>
  createdKey.value
    ? 'Zapisz klucz w bezpiecznym miejscu — zobaczysz go tylko teraz.'
    : 'Klucz umożliwia dostęp do publicznego API treści dla tego workspace.')

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
            <p class="text-xs" style="color: var(--muted)">Utworzono właśnie teraz</p>
          </div>
        </div>
        <RevealSecret :value="plaintext" label="Twój klucz API" />
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
          <UFormField label="Nazwa" name="name" help="Do rozpoznania klucza, np. „Strona produkcyjna”.">
            <UInput v-model="state.name" placeholder="np. Strona produkcyjna" icon="i-lucide-tag" size="lg" class="w-full" />
          </UFormField>

          <UFormField label="Zakresy" name="scopes" help="Opcjonalne. Ograniczają dostęp klucza.">
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
          <UButton color="neutral" icon="i-lucide-check" @click="open = false">Gotowe</UButton>
        </template>
        <template v-else>
          <UButton color="neutral" variant="ghost" @click="open = false">Anuluj</UButton>
          <UButton color="neutral" :loading="loading" icon="i-lucide-plus" @click="form?.submit()">Utwórz klucz</UButton>
        </template>
      </div>
    </template>
  </UModal>
</template>
