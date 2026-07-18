<script setup lang="ts">
import type { Channel } from '~~/shared/types/api'

const { t } = useI18n()
useHead({ title: () => t('settings.channels.callbackPageTitle') })

const route = useRoute()
const toast = useToast()
const { complete } = useChannels()

onMounted(async () => {
  const type = (sessionStorage.getItem('oauth_type') ?? '') as Channel['type']
  const code = route.query.code as string
  const state = route.query.state as string
  try {
    await complete({ type, code, state })
    toast.add({ title: t('settings.channels.toastConnected'), color: 'success' })
  }
  catch (err) {
    toast.add({ title: parseApiError(err).message, color: 'error' })
  }
  finally {
    sessionStorage.removeItem('oauth_type')
    await navigateTo('/settings/channels')
  }
})
</script>

<template>
  <div class="u-card flex flex-col items-center gap-4 px-6 py-16 text-center">
    <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin" style="color: var(--muted)" />
    <p class="card-title" style="font-size: 1.25rem">{{ $t('settings.channels.callbackHeading') }}</p>
    <p class="max-w-sm text-[15px]" style="color: var(--muted)">
      {{ $t('settings.channels.callbackHint') }}
    </p>
  </div>
</template>
