<script setup lang="ts">
const { isTrialing, trialDaysLeft, trialEndsAt } = usePlan()
const { portal } = useBilling()
const { t } = useI18n()
const toast = useToast()

const DISMISS_KEY = 'trial-banner-dismissed'

// Dismiss is per-trial: keyed on the trial end date so a new trial (or a
// changed end date) shows the banner again, but the same one stays dismissed.
const dismissed = ref(false)
watchEffect(() => {
  if (import.meta.client && trialEndsAt.value) {
    dismissed.value = localStorage.getItem(DISMISS_KEY) === trialEndsAt.value
  }
})

const show = computed(() => isTrialing.value && (trialDaysLeft.value ?? 99) <= 3 && !dismissed.value)

function dismiss(): void {
  if (import.meta.client && trialEndsAt.value) {
    localStorage.setItem(DISMISS_KEY, trialEndsAt.value)
  }
  dismissed.value = true
}

async function manage(): Promise<void> {
  try {
    window.location.href = await portal()
  }
  catch {
    toast.add({ title: t('settings.billing.portalFailed'), color: 'error' })
  }
}
</script>

<template>
  <div v-if="show" class="px-4 pt-4 sm:px-8">
    <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-xl px-4 py-3" style="background: var(--surface-strong)">
      <div class="min-w-0">
        <p class="text-sm font-medium" style="color: var(--ink)">{{ $t('trial.bannerTitle', { days: trialDaysLeft ?? 0 }) }}</p>
        <p class="truncate text-xs" style="color: var(--muted)">{{ $t('trial.bannerBody') }}</p>
      </div>
      <div class="flex shrink-0 items-center gap-2">
        <UButton size="xs" color="neutral" @click="manage">{{ $t('trial.bannerManage') }}</UButton>
        <UButton size="xs" color="neutral" variant="ghost" icon="i-lucide-x" :aria-label="$t('trial.bannerDismissAria')" @click="dismiss" />
      </div>
    </div>
  </div>
</template>
