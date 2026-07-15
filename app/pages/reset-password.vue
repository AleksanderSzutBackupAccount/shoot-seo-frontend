<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import * as z from 'zod'

definePageMeta({ layout: 'auth' })
useHead({ title: 'Ustaw nowe hasło — Shoot SEO' })

const { resetPassword } = useAuth()
const route = useRoute()

const schema = z.object({
  email: z.string().email('Nieprawidłowy adres e-mail'),
  password: z.string().min(8, 'Hasło musi mieć co najmniej 8 znaków'),
  password_confirmation: z.string().min(1, 'Potwierdź hasło'),
}).refine(data => data.password === data.password_confirmation, {
  message: 'Hasła nie są takie same',
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
      <p class="eyebrow mb-3">Nowe hasło</p>
      <h1 class="card-title">Ustaw nowe hasło</h1>
      <p class="mt-2 text-[15px]" style="color: var(--muted)">Wpisz nowe hasło do swojego konta.</p>
    </div>

    <UAlert
      v-if="done"
      color="success"
      variant="subtle"
      icon="i-lucide-check-circle"
      title="Hasło zmienione"
      :actions="[{ label: 'Przejdź do logowania', color: 'success', to: '/login' }]"
    />

    <template v-else>
      <UAlert
        v-if="!token"
        color="warning"
        variant="subtle"
        icon="i-lucide-triangle-alert"
        title="Brak tokenu resetu"
        description="Otwórz link z wiadomości e-mail, aby zresetować hasło."
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
        <UFormField label="E-mail" name="email">
          <UInput v-model="state.email" type="email" icon="i-lucide-mail" class="w-full" />
        </UFormField>
        <UFormField label="Nowe hasło" name="password">
          <UInput v-model="state.password" type="password" placeholder="••••••••" icon="i-lucide-lock" class="w-full" />
        </UFormField>
        <UFormField label="Powtórz hasło" name="password_confirmation">
          <UInput v-model="state.password_confirmation" type="password" placeholder="••••••••" icon="i-lucide-lock" class="w-full" />
        </UFormField>
        <UButton type="submit" size="lg" :loading="loading" :disabled="!token" class="w-full justify-center">Zmień hasło</UButton>
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
