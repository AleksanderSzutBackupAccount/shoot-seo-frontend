<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import * as z from 'zod'

definePageMeta({ layout: 'auth' })
useHead({ title: 'Logowanie — Shut SEO' })

const { login } = useAuth()
const route = useRoute()

const schema = z.object({
  email: z.string().email('Nieprawidłowy adres e-mail'),
  password: z.string().min(1, 'Hasło jest wymagane'),
})
type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({ email: '', password: '' })
const form = useTemplateRef('form')
const loading = ref(false)
const serverError = ref<string | null>(null)

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true
  serverError.value = null
  try {
    const res = await login(event.data)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : null
    await navigateTo(redirect ?? (res.workspaces.length > 0 ? '/dashboard' : '/workspaces/new'))
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
      <p class="eyebrow mb-3">Logowanie</p>
      <h1 class="card-title">Zaloguj się</h1>
      <p class="mt-2 text-[15px]" style="color: var(--muted)">Wejdź do panelu Shut SEO</p>
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
      <UFormField label="E-mail" name="email">
        <UInput v-model="state.email" type="email" placeholder="ty@firma.pl" icon="i-lucide-mail" class="w-full" />
      </UFormField>

      <UFormField label="Hasło" name="password">
        <UInput v-model="state.password" type="password" placeholder="••••••••" icon="i-lucide-lock" class="w-full" />
      </UFormField>

      <div class="flex justify-end">
        <ULink to="/forgot-password" class="auth-link text-sm">Nie pamiętasz hasła?</ULink>
      </div>

      <UButton type="submit" size="lg" :loading="loading" class="w-full justify-center">Zaloguj się</UButton>
    </UForm>

    <p class="mt-9 text-center text-sm" style="color: var(--muted)">
      Nie masz konta?
      <ULink to="/register" class="auth-link auth-link--strong">Zarejestruj się</ULink>
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
