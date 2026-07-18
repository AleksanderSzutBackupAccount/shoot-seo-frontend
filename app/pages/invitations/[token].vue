<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { t } = useI18n()
useHead({ title: () => t('auth.invitationPageTitle') })

const route = useRoute()
const token = route.params.token as string

const { fetchInvitation, acceptInvitation } = useWorkspace()
const toast = useToast()

const { data: invitation, error } = await useAsyncData(
  `invitation:${token}`,
  () => fetchInvitation(token),
)

const accepting = ref(false)

async function accept() {
  accepting.value = true
  try {
    await acceptInvitation(token)
    toast.add({ title: t('auth.joinedWorkspaceToast'), color: 'success', icon: 'i-lucide-check' })
    await navigateTo('/dashboard')
  }
  catch (err) {
    toast.add({ title: parseApiError(err).message, color: 'error' })
  }
  finally {
    accepting.value = false
  }
}
</script>

<template>
  <div class="u-card relative overflow-hidden px-6 py-12 sm:px-8">
    <AppGradientOrbs variant="corner" />
    <div class="relative z-10">
      <div v-if="error || !invitation" class="flex flex-col items-center gap-5 text-center">
        <span class="surface-strong flex size-14 items-center justify-center rounded-full">
          <UIcon name="i-lucide-mail-x" class="size-6" style="color: var(--ink)" />
        </span>
        <div>
          <p class="eyebrow mb-3">{{ $t('auth.invitationEyebrow') }}</p>
          <h1 class="card-title">{{ $t('auth.invitationInvalidTitle') }}</h1>
          <p class="mt-2 text-[15px]" style="color: var(--muted)">{{ $t('auth.invitationInvalidDescription') }}</p>
        </div>
        <UButton to="/dashboard" variant="outline">{{ $t('auth.goToDashboard') }}</UButton>
      </div>

      <div v-else class="flex flex-col items-center gap-5 text-center">
        <span class="surface-strong flex size-14 items-center justify-center rounded-full">
          <UIcon name="i-lucide-mail-plus" class="size-6" style="color: var(--ink)" />
        </span>
        <div>
          <p class="eyebrow mb-3">{{ $t('auth.invitationEyebrow') }}</p>
          <h1 class="card-title">{{ $t('auth.invitationValidTitle') }}</h1>
          <p class="mt-2 text-[15px]" style="color: var(--muted)">
            {{ $t('auth.joinPrefix') }}
            <span style="color: var(--ink); font-weight: 600">{{ invitation.workspace.name }}</span>
          </p>
        </div>

        <div class="flex items-center justify-center gap-2 text-sm" style="color: var(--muted)">
          <UIcon name="i-lucide-mail" class="size-4" />
          <span>{{ invitation.email }}</span>
          <span style="color: var(--hairline-strong)">•</span>
          <UBadge :label="invitation.role" color="neutral" variant="subtle" size="sm" />
        </div>

        <UButton size="lg" :loading="accepting" icon="i-lucide-check" class="w-full justify-center" @click="accept">
          {{ $t('auth.acceptInvitation') }}
        </UButton>
      </div>
    </div>
  </div>
</template>
