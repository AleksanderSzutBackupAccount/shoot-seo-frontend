<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import * as z from 'zod'

definePageMeta({ layout: 'auth' })
useHead({ title: 'Reset hasła — Shut SEO' })

const { forgotPassword } = useAuth()

const schema = z.object({
  email: z.string().email('Nieprawidłowy adres e-mail'),
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
      <p class="eyebrow mb-3">Reset hasła</p>
      <h1 class="card-title">Nie pamiętasz hasła?</h1>
      <p class="mt-2 text-[15px]" style="color: var(--muted)">Wyślemy Ci link do zresetowania hasła.</p>
    </div>

    <UAlert
      v-if="sent"
      color="success"
      variant="subtle"
      icon="i-lucide-mail-check"
      title="Sprawdź skrzynkę"
      description="Jeśli konto istnieje, wysłaliśmy wiadomość z linkiem do resetu hasła."
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
        <UFormField label="E-mail" name="email">
          <UInput v-model="state.email" type="email" placeholder="ty@firma.pl" icon="i-lucide-mail" class="w-full" />
        </UFormField>
        <UButton type="submit" size="lg" :loading="loading" class="w-full justify-center">Wyślij link resetujący</UButton>
      </UForm>
    </template>

    <p class="mt-9 text-center text-sm" style="color: var(--muted)">
      <ULink to="/login" class="auth-link auth-link--strong">Wróć do logowania</ULink>
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
