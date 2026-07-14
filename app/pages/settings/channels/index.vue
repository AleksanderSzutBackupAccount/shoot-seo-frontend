<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import * as z from 'zod'
import type { Channel } from '~~/shared/types/api'

useHead({ title: 'Kanały — Shut SEO' })

type SocialType = 'facebook' | 'linkedin'

const CHANNEL_DEFS: { type: SocialType, label: string, icon: string }[] = [
  { type: 'facebook', label: 'Facebook', icon: 'i-lucide-facebook' },
  { type: 'linkedin', label: 'LinkedIn', icon: 'i-lucide-linkedin' },
]

const { current } = useWorkspace()
const { list, connect, disconnect } = useChannels()
const { get: getPublicHost, set: setPublicHost } = usePublicHost()
const toast = useToast()

const { data: channels, status, refresh } = await useAsyncData(
  'channels',
  () => list(),
  { watch: [() => current.value?.id], default: () => [] as Channel[] },
)

const rows = computed(() =>
  CHANNEL_DEFS.map(def => ({
    ...def,
    channel: (channels.value ?? []).find(c => c.type === def.type) ?? null,
  })),
)

const connectingType = ref<SocialType | null>(null)
const disconnectTarget = ref<Channel | null>(null)
const disconnecting = ref(false)

async function handleConnect(type: SocialType) {
  connectingType.value = type
  try {
    const res = await connect(type)
    sessionStorage.setItem('oauth_type', type)
    window.location.href = res.authorization_url
  }
  catch (err) {
    toast.add({ title: parseApiError(err).message, color: 'error' })
    connectingType.value = null
  }
}

async function confirmDisconnect() {
  if (!disconnectTarget.value) return
  disconnecting.value = true
  try {
    await disconnect(disconnectTarget.value.id)
    toast.add({ title: 'Kanał odłączony', color: 'success' })
    disconnectTarget.value = null
    await refresh()
  }
  catch (err) {
    toast.add({ title: parseApiError(err).message, color: 'error' })
  }
  finally {
    disconnecting.value = false
  }
}

// Public site URL — used to build absolute links in published social posts.
const { data: publicHost, status: publicHostStatus } = await useAsyncData(
  'public-host',
  () => getPublicHost(),
  { watch: [() => current.value?.id] },
)

const hostSchema = z.object({
  public_base_url: z.string().url('Podaj poprawny adres URL (https://…)').optional().or(z.literal('')),
})
type HostSchema = z.output<typeof hostSchema>

const hostState = reactive<Partial<HostSchema>>({ public_base_url: '' })
watch(publicHost, (value) => { hostState.public_base_url = value ?? '' }, { immediate: true })

const hostForm = useTemplateRef('hostForm')
const savingHost = ref(false)

async function savePublicHost(event: FormSubmitEvent<HostSchema>) {
  savingHost.value = true
  try {
    const res = await setPublicHost(event.data.public_base_url ?? '')
    hostState.public_base_url = res.public_base_url ?? ''
    toast.add({ title: 'Adres URL zapisany', color: 'success' })
  }
  catch (err) {
    const { message, fieldErrors } = parseApiError(err)
    toast.add({ title: message, color: 'error' })
    if (fieldErrors.length) hostForm.value?.setErrors(fieldErrors)
  }
  finally {
    savingHost.value = false
  }
}
</script>

<template>
  <div>
    <AppPageHeader
      eyebrow="Ustawienia"
      title="Kanały"
      description="Podłącz konta społecznościowe, aby publikować treści automatycznie po zapisaniu wpisu."
    />

    <SettingsTabs />

    <div v-if="status === 'pending'" class="flex justify-center py-20">
      <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin" style="color: var(--muted)" />
    </div>

    <div v-else class="grid gap-5 sm:grid-cols-2">
      <div v-for="row in rows" :key="row.type" class="u-card p-6">
        <div class="flex items-center gap-3">
          <div class="surface-strong flex size-11 shrink-0 items-center justify-center rounded-full">
            <UIcon :name="row.icon" class="size-5" style="color: var(--ink)" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="card-title" style="font-size: 1.15rem">{{ row.label }}</p>
            <p class="mt-0.5 truncate text-sm" style="color: var(--muted)">
              {{ row.channel?.external_account_name || 'Nie podłączono' }}
            </p>
          </div>
          <span class="chip shrink-0" :class="row.channel?.status === 'active' ? 'chip--published' : 'chip--draft'">
            {{ row.channel?.status === 'active' ? 'Podłączono' : 'Rozłączono' }}
          </span>
        </div>

        <div class="mt-5 flex justify-end">
          <UButton
            v-if="row.channel?.status === 'active'"
            color="neutral"
            variant="ghost"
            icon="i-lucide-unlink"
            @click="disconnectTarget = row.channel"
          >
            Odłącz
          </UButton>
          <UButton
            v-else
            color="neutral"
            icon="i-lucide-link"
            :loading="connectingType === row.type"
            @click="handleConnect(row.type)"
          >
            Połącz
          </UButton>
        </div>
      </div>
    </div>

    <div class="u-card mt-5 p-6">
      <p class="eyebrow">Publiczny adres strony</p>
      <p class="card-title mt-2" style="font-size: 1.15rem">Adres URL Twojej witryny</p>
      <p class="mt-2 max-w-xl text-sm" style="color: var(--muted)">
        Używamy go do budowania pełnych linków w treściach publikowanych na kanałach społecznościowych.
      </p>

      <div v-if="publicHostStatus === 'pending'" class="mt-5 flex justify-center py-4">
        <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin" style="color: var(--muted)" />
      </div>
      <UForm
        v-else
        ref="hostForm"
        :schema="hostSchema"
        :state="hostState"
        class="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end"
        @submit="savePublicHost"
      >
        <UFormField label="Adres URL" name="public_base_url" class="flex-1">
          <UInput
            v-model="hostState.public_base_url"
            type="url"
            placeholder="https://twoja-strona.pl"
            icon="i-lucide-globe"
            size="lg"
            class="w-full"
          />
        </UFormField>
        <UButton type="submit" color="neutral" size="lg" :loading="savingHost">Zapisz</UButton>
      </UForm>
    </div>

    <UModal
      :open="disconnectTarget !== null"
      title="Odłączyć kanał?"
      :description="`Przestaniemy publikować treści na koncie „${disconnectTarget?.external_account_name ?? disconnectTarget?.name}”. Będziesz mógł podłączyć je ponownie w każdej chwili.`"
      @update:open="(value: boolean) => { if (!value) disconnectTarget = null }"
    >
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton color="neutral" variant="ghost" @click="disconnectTarget = null">Anuluj</UButton>
          <UButton color="error" :loading="disconnecting" @click="confirmDisconnect">Odłącz</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
