<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import * as z from 'zod'

definePageMeta({ layout: 'auth' })
useHead({ title: 'Rejestracja — Shoot SEO' })

const { register } = useAuth()

const schema = z.object({
  name: z.string().min(1, 'Imię i nazwisko jest wymagane'),
  email: z.string().email('Nieprawidłowy adres e-mail'),
  password: z.string().min(8, 'Hasło musi mieć co najmniej 8 znaków'),
  password_confirmation: z.string().min(1, 'Potwierdź hasło'),
}).refine(data => data.password === data.password_confirmation, {
  message: 'Hasła nie są takie same',
  path: ['password_confirmation'],
})
type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
})
const form = useTemplateRef('form')
const loading = ref(false)
const serverError = ref<string | null>(null)

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true
  serverError.value = null
  try {
    await register(event.data)
    // New account has no workspace yet -> onboarding.
    await navigateTo('/workspaces/new')
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
      <p class="eyebrow mb-3">Rejestracja</p>
      <h1 class="card-title">Załóż konto</h1>
      <p class="mt-2 text-[15px]" style="color: var(--muted)">Rozpocznij pracę z Shoot SEO</p>
    </div>

    <UAlert
      v-if="serverError"
      color="error"
      variant="subtle"
      icon="i-lucide-triangle-alert"
      :title="serverError"
      class="mb-5"
    />

    <UForm ref="form" :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
      <UFormField label="Imię i nazwisko" name="name">
        <UInput v-model="state.name" placeholder="Jan Kowalski" icon="i-lucide-user" class="w-full" />
      </UFormField>

      <UFormField label="E-mail" name="email">
        <UInput v-model="state.email" type="email" placeholder="ty@firma.pl" icon="i-lucide-mail" class="w-full" />
      </UFormField>

      <UFormField label="Hasło" name="password">
        <UInput v-model="state.password" type="password" placeholder="••••••••" icon="i-lucide-lock" class="w-full" />
      </UFormField>

      <UFormField label="Powtórz hasło" name="password_confirmation">
        <UInput v-model="state.password_confirmation" type="password" placeholder="••••••••" icon="i-lucide-lock" class="w-full" />
      </UFormField>

      <UButton type="submit" size="lg" :loading="loading" class="w-full justify-center">Zarejestruj się</UButton>
    </UForm>

    <p class="mt-9 text-center text-sm" style="color: var(--muted)">
      Masz już konto?
      <ULink to="/login" class="auth-link auth-link--strong">Zaloguj się</ULink>
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
