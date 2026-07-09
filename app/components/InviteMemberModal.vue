<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import * as z from 'zod'
import type { Role } from '~~/shared/types/api'

const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ invited: [] }>()

const { inviteMember } = useWorkspace()
const toast = useToast()

const roleOptions: { label: string, value: Role }[] = [
  { label: 'Użytkownik', value: 'user' },
  { label: 'Administrator', value: 'admin' },
]

const schema = z.object({
  email: z.string().email('Nieprawidłowy adres e-mail'),
  role: z.enum(['admin', 'user']),
})
type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({ email: '', role: 'user' })
const form = useTemplateRef('form')
const loading = ref(false)
const serverError = ref<string | null>(null)

watch(open, (isOpen) => {
  if (isOpen) {
    state.email = ''
    state.role = 'user'
    serverError.value = null
  }
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true
  serverError.value = null
  try {
    await inviteMember(event.data.email, event.data.role)
    toast.add({ title: 'Zaproszenie wysłane', color: 'success', icon: 'i-lucide-mail-check' })
    emit('invited')
    open.value = false
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
  <UModal
    v-model:open="open"
    title="Zaproś członka"
    description="Wyślij zaproszenie e-mailem do wybranego workspace."
  >
    <template #body>
      <UAlert
        v-if="serverError"
        color="error"
        variant="subtle"
        icon="i-lucide-triangle-alert"
        :title="serverError"
        class="mb-5"
      />

      <UForm ref="form" :schema="schema" :state="state" class="space-y-5" @submit="onSubmit">
        <UFormField label="Adres e-mail" name="email">
          <UInput v-model="state.email" type="email" placeholder="osoba@firma.pl" icon="i-lucide-mail" size="lg" class="w-full" />
        </UFormField>
        <UFormField label="Rola" name="role" help="Administratorzy mogą zarządzać treściami i zespołem.">
          <USelect v-model="state.role" :items="roleOptions" size="lg" class="w-full" />
        </UFormField>
      </UForm>
    </template>

    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton color="neutral" variant="ghost" @click="open = false">Anuluj</UButton>
        <UButton color="neutral" :loading="loading" icon="i-lucide-send" @click="form?.submit()">Wyślij zaproszenie</UButton>
      </div>
    </template>
  </UModal>
</template>
