<script setup lang="ts">
useHead({ title: 'Weryfikacja e-mail — Shut SEO' })

const { user, isEmailVerified, verifyEmail, resendVerification } = useAuth()
const route = useRoute()
const toast = useToast()

type Status = 'idle' | 'verifying' | 'verified' | 'error'
const status = ref<Status>(isEmailVerified.value ? 'verified' : 'idle')
const errorMessage = ref<string | null>(null)
const resending = ref(false)

onMounted(async () => {
  const id = typeof route.query.id === 'string' ? route.query.id : null
  const hash = typeof route.query.hash === 'string' ? route.query.hash : null
  if (!id || !hash || isEmailVerified.value) return

  status.value = 'verifying'
  try {
    await verifyEmail(id, hash)
    status.value = 'verified'
    toast.add({ title: 'E-mail zweryfikowany', color: 'success' })
  }
  catch (err) {
    status.value = 'error'
    errorMessage.value = parseApiError(err).message
  }
})

async function resend() {
  resending.value = true
  try {
    await resendVerification()
    toast.add({
      title: 'Wysłano ponownie',
      description: 'Sprawdź swoją skrzynkę pocztową.',
      color: 'success',
    })
  }
  catch (err) {
    toast.add({ title: parseApiError(err).message, color: 'error' })
  }
  finally {
    resending.value = false
  }
}
</script>

<template>
  <UContainer class="max-w-xl py-6">
    <div class="u-card relative overflow-hidden px-6 py-14 sm:px-10">
      <AppGradientOrbs variant="corner" />
      <div class="relative z-10 mx-auto flex max-w-md flex-col items-center gap-5 text-center">
        <div v-if="status === 'verified'" class="flex flex-col items-center gap-5">
          <span class="surface-strong flex size-14 items-center justify-center rounded-full">
            <UIcon name="i-lucide-badge-check" class="size-6" style="color: var(--ink)" />
          </span>
          <div>
            <p class="eyebrow mb-3">Weryfikacja e-mail</p>
            <h1 class="card-title">E-mail zweryfikowany</h1>
            <p class="mt-2 text-[15px]" style="color: var(--muted)">Twój adres e-mail został potwierdzony.</p>
          </div>
          <UButton to="/dashboard" size="lg">Przejdź do panelu</UButton>
        </div>

        <div v-else-if="status === 'verifying'" class="flex flex-col items-center gap-5">
          <span class="surface-strong flex size-14 items-center justify-center rounded-full">
            <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin" style="color: var(--ink)" />
          </span>
          <h1 class="card-title">Weryfikujemy Twój e-mail…</h1>
        </div>

        <div v-else class="flex w-full flex-col items-center gap-5">
          <span class="surface-strong flex size-14 items-center justify-center rounded-full">
            <UIcon name="i-lucide-mail" class="size-6" style="color: var(--ink)" />
          </span>
          <div>
            <p class="eyebrow mb-3">Weryfikacja e-mail</p>
            <h1 class="card-title">Potwierdź swój adres e-mail</h1>
            <p class="mt-2 text-[15px]" style="color: var(--muted)">
              Wysłaliśmy wiadomość na adres
              <span style="color: var(--ink); font-weight: 500">{{ user?.email }}</span>.
              Kliknij link w wiadomości, aby aktywować konto.
            </p>
          </div>

          <UAlert
            v-if="status === 'error'"
            color="error"
            variant="subtle"
            icon="i-lucide-triangle-alert"
            :title="errorMessage ?? 'Nie udało się zweryfikować linku.'"
            class="w-full text-left"
          />

          <div class="flex flex-wrap items-center justify-center gap-3 pt-1">
            <UButton :loading="resending" variant="outline" icon="i-lucide-send" @click="resend">
              Wyślij link ponownie
            </UButton>
            <UButton to="/dashboard" variant="ghost">Pomiń na razie</UButton>
          </div>
        </div>
      </div>
    </div>
  </UContainer>
</template>
