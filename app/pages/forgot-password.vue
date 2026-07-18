<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import * as z from 'zod'

definePageMeta({ layout: 'auth' })

const { t } = useI18n()
useHead({ title: () => t('auth.forgotPageTitle') })

const { forgotPassword } = useAuth()

const schema = z.object({
  email: z.string().email(t('auth.invalidEmail')),
})
type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({ email: '' })
const loading = ref(false)
const sent = ref(false)
const serverError = ref<string | null>(null)

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true
  serverError.value = null
  try {
    await forgotPassword(event.data.email)
    sent.value = true
  }
  catch (err) {
    serverError.value = parseApiError(err).message
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <div class="mb-8">
      <p class="eyebrow mb-3">{{ $t('auth.forgotEyebrow') }}</p>
      <h1 class="card-title">{{ $t('auth.forgotPasswordLink') }}</h1>
      <p class="mt-2 text-[15px]" style="color: var(--muted)">{{ $t('auth.forgotSubtitle') }}</p>
    </div>

    <UAlert
      v-if="sent"
      color="success"
      variant="subtle"
      icon="i-lucide-mail-check"
      :title="$t('auth.checkInboxTitle')"
      :description="$t('auth.checkInboxDescription')"
    />

    <template v-else>
      <UAlert
        v-if="serverError"
        color="error"
        variant="subtle"
        icon="i-lucide-triangle-alert"
        :title="serverError"
        class="mb-5"
      />

      <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
        <UFormField :label="$t('auth.emailLabel')" name="email">
          <UInput v-model="state.email" type="email" :placeholder="$t('auth.emailPlaceholder')" icon="i-lucide-mail" class="w-full" />
        </UFormField>
        <UButton type="submit" size="lg" :loading="loading" class="w-full justify-center">{{ $t('auth.sendResetLink') }}</UButton>
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
