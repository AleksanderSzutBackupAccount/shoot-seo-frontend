<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import * as z from 'zod'

definePageMeta({ layout: 'auth' })

const { t } = useI18n()
useHead({ title: t('auth.resetPageTitle') })

const { resetPassword } = useAuth()
const route = useRoute()

const schema = z.object({
  email: z.string().email(t('auth.invalidEmail')),
  password: z.string().min(8, t('auth.passwordMinLength')),
  password_confirmation: z.string().min(1, t('auth.confirmPasswordRequired')),
}).refine(data => data.password === data.password_confirmation, {
  message: t('auth.passwordMismatch'),
  path: ['password_confirmation'],
})
type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  email: typeof route.query.email === 'string' ? route.query.email : '',
  password: '',
  password_confirmation: '',
})
const token = computed(() => (typeof route.query.token === 'string' ? route.query.token : ''))

const form = useTemplateRef('form')
const loading = ref(false)
const done = ref(false)
const serverError = ref<string | null>(null)

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true
  serverError.value = null
  try {
    await resetPassword({ token: token.value, ...event.data })
    done.value = true
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
  <div>
    <div class="mb-8">
      <p class="eyebrow mb-3">{{ $t('auth.resetEyebrow') }}</p>
      <h1 class="card-title">{{ $t('auth.resetTitle') }}</h1>
      <p class="mt-2 text-[15px]" style="color: var(--muted)">{{ $t('auth.resetSubtitle') }}</p>
    </div>

    <UAlert
      v-if="done"
      color="success"
      variant="subtle"
      icon="i-lucide-check-circle"
      :title="$t('auth.passwordChangedTitle')"
      :actions="[{ label: $t('auth.goToLogin'), color: 'success', to: '/login' }]"
    />

    <template v-else>
      <UAlert
        v-if="!token"
        color="warning"
        variant="subtle"
        icon="i-lucide-triangle-alert"
        :title="$t('auth.noResetToken')"
        :description="$t('auth.openEmailLink')"
        class="mb-5"
      />
      <UAlert
        v-else-if="serverError"
        color="error"
        variant="subtle"
        icon="i-lucide-triangle-alert"
        :title="serverError"
        class="mb-5"
      />

      <UForm ref="form" :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
        <UFormField :label="$t('auth.emailLabel')" name="email">
          <UInput v-model="state.email" type="email" icon="i-lucide-mail" class="w-full" />
        </UFormField>
        <UFormField :label="$t('auth.newPasswordLabel')" name="password">
          <UInput v-model="state.password" type="password" placeholder="••••••••" icon="i-lucide-lock" class="w-full" />
        </UFormField>
        <UFormField :label="$t('auth.confirmPasswordLabel')" name="password_confirmation">
          <UInput v-model="state.password_confirmation" type="password" placeholder="••••••••" icon="i-lucide-lock" class="w-full" />
        </UFormField>
        <UButton type="submit" size="lg" :loading="loading" :disabled="!token" class="w-full justify-center">{{ $t('auth.changePassword') }}</UButton>
      </UForm>
    </template>

    <p class="mt-9 text-center text-sm" style="color: var(--muted)">
      <ULink to="/login" class="auth-link auth-link--strong">{{ $t('auth.backToLogin') }}</ULink>
    </p>
  </div>
</template>

<style scoped>
.auth-link {
  color: var(--muted);
  transition: color 0.18s ease;
}
.auth-link:hover {
  color: var(--ink);
}
.auth-link--strong {
  color: var(--ink);
  font-weight: 500;
}
.auth-link--strong:hover {
  text-decoration: underline;
  text-underline-offset: 3px;
}
</style>
