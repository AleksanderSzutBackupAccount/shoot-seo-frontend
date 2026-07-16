<script setup lang="ts">
import type { CurrentPlan, Plan } from '~~/shared/types/api'

useHead({ title: 'Plan i płatności — Shoot SEO' })

const { current: currentWorkspace } = useWorkspace()
const { fetchPlans, fetchCurrent, checkout, portal } = useBilling()
const toast = useToast()

const { data: current, status } = await useAsyncData(
  'billing-current',
  () => fetchCurrent(),
  { watch: [() => currentWorkspace.value?.id], default: () => null as CurrentPlan | null },
)
const { data: plans, status: plansStatus } = await useAsyncData(
  'billing-plans',
  () => fetchPlans(),
  { watch: [() => currentWorkspace.value?.id], default: () => [] as Plan[] },
)

const loading = computed(() => status.value === 'pending' || plansStatus.value === 'pending')

/** Tracks which button triggered a redirect: a plan code, `'manage'`, or `null`. */
const busy = ref<string | null>(null)

const STATUS_LABELS: Record<string, string> = {
  active: 'Aktywny',
  trialing: 'Okres próbny',
  past_due: 'Zaległa płatność',
  canceled: 'Anulowana',
  incomplete: 'Niedokończona',
  free: 'Plan darmowy',
}

function statusLabel(value: string): string {
  return STATUS_LABELS[value] ?? value
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('pl-PL', { dateStyle: 'medium' })
}

function formatPrice(cents: number, currency: string): string {
  return `${(cents / 100).toFixed(0)} ${currency}`
}

async function upgrade(code: string) {
  busy.value = code
  try {
    window.location.href = await checkout(code)
  }
  catch (e: unknown) {
    const httpStatus = (e as { statusCode?: number }).statusCode
    toast.add({
      title: httpStatus === 403 ? 'Tylko administrator może zmienić plan.' : 'Nie udało się rozpocząć płatności.',
      color: 'error',
    })
    busy.value = null
  }
}

async function manage() {
  busy.value = 'manage'
  try {
    window.location.href = await portal()
  }
  catch (e: unknown) {
    const httpStatus = (e as { statusCode?: number }).statusCode
    toast.add({
      title: httpStatus === 403 ? 'Tylko administrator może zmienić plan.' : 'Brak aktywnej subskrypcji do zarządzania.',
      color: 'error',
    })
    busy.value = null
  }
}
</script>

<template>
  <div>
    <AppPageHeader
      eyebrow="Ustawienia"
      title="Plan i płatności"
      description="Zarządzaj planem subskrypcji, limitami AI i danymi rozliczeniowymi."
    />

    <SettingsTabs />

    <div v-if="loading" class="flex justify-center py-20">
      <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin" style="color: var(--muted)" />
    </div>

    <div v-else class="space-y-6">
      <section class="u-card p-6">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 class="card-title">Twój plan</h2>
            <p v-if="current" class="mt-2 text-sm" style="color: var(--muted)">
              {{ current.name }}
              <span class="chip" :class="current.status === 'active' || current.status === 'trialing' ? 'chip--published' : 'chip--draft'">
                {{ statusLabel(current.status) }}
              </span>
              <span v-if="current.current_period_end"> · odnowienie {{ formatDate(current.current_period_end) }}</span>
            </p>
          </div>
          <UButton
            v-if="current && current.code !== 'free'"
            color="neutral" variant="soft" :loading="busy === 'manage'" :disabled="busy !== null"
            @click="manage"
          >
            Zarządzaj subskrypcją
          </UButton>
        </div>

        <AiUsageMeter class="mt-4" />
      </section>

      <section class="grid gap-4 sm:grid-cols-3">
        <div v-for="plan in plans" :key="plan.code" class="u-card p-6">
          <h3 class="card-title">{{ plan.name }}</h3>
          <p class="mt-1 text-2xl" style="color: var(--ink)">
            {{ formatPrice(plan.price_cents, plan.currency) }}
            <span class="text-sm" style="color: var(--muted)">/mies.</span>
          </p>
          <ul class="mt-3 space-y-1 text-sm" style="color: var(--body)">
            <li>AI: {{ plan.entitlements['ai.token_limit'].toLocaleString('pl-PL') }} tokenów/mies.</li>
            <li>Autonomous: {{ plan.entitlements['autonomous.enabled'] ? 'tak' : 'nie' }}</li>
          </ul>

          <UButton
            v-if="plan.purchasable && current?.code !== plan.code"
            class="mt-4" color="neutral" :loading="busy === plan.code" :disabled="busy !== null"
            @click="upgrade(plan.code)"
          >
            Wybierz {{ plan.name }}
          </UButton>
          <p v-else-if="current?.code === plan.code" class="mt-4 text-sm" style="color: var(--muted)">
            Aktualny plan
          </p>
        </div>
      </section>
    </div>
  </div>
</template>
