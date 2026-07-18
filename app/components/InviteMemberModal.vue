<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import * as z from 'zod'
import type { Role } from '~~/shared/types/api'

const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ invited: [] }>()

const { inviteMember } = useWorkspace()
const toast = useToast()
const { t } = useI18n()

const roleOptions = computed<{ label: string, value: Role }[]>(() => [
  { label: t('dashboard.roleUser'), value: 'user' },
  { label: t('dashboard.roleAdmin'), value: 'admin' },
])

const schema = z.object({
  email: z.string().email(t('auth.invalidEmail')),
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
    toast.add({ title: t('members.toastInvited'), color: 'success', icon: 'i-lucide-mail-check' })
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
    :title="$t('members.inviteModalTitle')"
    :description="$t('members.inviteModalDescription')"
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
        <UFormField :label="$t('members.emailLabel')" name="email">
          <UInput v-model="state.email" type="email" :placeholder="$t('members.emailPlaceholder')" icon="i-lucide-mail" size="lg" class="w-full" />
        </UFormField>
        <UFormField :label="$t('members.roleLabel')" name="role" :help="$t('members.roleHelp')">
          <USelect v-model="state.role" :items="roleOptions" size="lg" class="w-full" />
        </UFormField>
      </UForm>
    </template>

    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton color="neutral" variant="ghost" @click="open = false">{{ $t('common.cancel') }}</UButton>
        <UButton color="neutral" :loading="loading" icon="i-lucide-send" @click="form?.submit()">{{ $t('members.sendInvite') }}</UButton>
      </div>
    </template>
  </UModal>
</template>
