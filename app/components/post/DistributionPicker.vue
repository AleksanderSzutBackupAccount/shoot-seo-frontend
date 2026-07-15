<script setup lang="ts">
import type { Channel, Publication } from '~~/shared/types/api'

const props = defineProps<{
  postId: string
}>()

const { list: listChannels } = useChannels()
const { list: listPublications } = usePublications()
const { set: setPostChannels } = usePostChannels()
const toast = useToast()

const { data: channels, status: channelsStatus } = await useAsyncData(
  () => `distribution-channels-${props.postId}`,
  () => listChannels(),
  { default: () => [] as Channel[] },
)

const { data: publications, status: publicationsStatus } = await useAsyncData(
  () => `distribution-publications-${props.postId}`,
  () => listPublications(),
  { default: () => [] as Publication[] },
)

const loading = computed(() => channelsStatus.value === 'pending' || publicationsStatus.value === 'pending')

/** Connected, active social channels (headless/API channels aren't distribution targets). */
const socialChannels = computed(() =>
  (channels.value ?? []).filter(c => c.type !== 'headless' && c.status === 'active'),
)

// Seed the current selection from existing publication rows for this post —
// only `pending` rows are current targets; `success`/`failed` are delivery
// history that SetPostChannelTargets leaves intact and doesn't reconcile.
const selected = ref<string[]>([])
watch(publications, (pubs) => {
  selected.value = (pubs ?? [])
    .filter(p => p.post_id === props.postId && p.status === 'pending')
    .map(p => p.channel_id)
}, { immediate: true })

const saving = ref(false)

function channelLabel(channel: Channel): string {
  return SOCIAL_CHANNEL_META[channel.type]?.label ?? channel.name
}

function channelIcon(channel: Channel): string {
  return SOCIAL_CHANNEL_META[channel.type]?.icon ?? 'i-lucide-share-2'
}

async function toggle(channelId: string, checked: boolean) {
  const previous = selected.value

  const next = new Set(selected.value)
  if (checked) next.add(channelId)
  else next.delete(channelId)
  selected.value = [...next]

  saving.value = true
  try {
    await setPostChannels(props.postId, selected.value)
  }
  catch (err) {
    selected.value = previous
    toast.add({ title: parseApiError(err).message, color: 'error' })
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="u-card p-6">
    <div class="flex items-center justify-between gap-2">
      <h2 class="card-title" style="font-size: 1.25rem">Dystrybucja</h2>
      <UIcon v-if="saving" name="i-lucide-loader-circle" class="size-4 animate-spin" style="color: var(--muted)" />
    </div>
    <p class="mt-1 text-sm" style="color: var(--muted)">Wybierz kanały społecznościowe, na których opublikujemy ten wpis.</p>

    <div v-if="loading" class="mt-5 flex justify-center py-4">
      <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin" style="color: var(--muted)" />
    </div>

    <div
      v-else-if="socialChannels.length === 0"
      class="mt-4 flex flex-col items-start gap-3 rounded-lg p-4"
      style="background: var(--surface-strong); border: 1px solid var(--hairline)"
    >
      <p class="text-sm" style="color: var(--muted)">Brak podłączonych kanałów społecznościowych.</p>
      <UButton to="/settings/channels" color="neutral" variant="outline" size="sm" icon="i-lucide-link">
        Podłącz kanał
      </UButton>
    </div>

    <div v-else class="mt-5 flex flex-col gap-3">
      <UCheckbox
        v-for="channel in socialChannels"
        :key="channel.id"
        :model-value="selected.includes(channel.id)"
        :label="channelLabel(channel)"
        :description="channel.external_account_name ?? undefined"
        :disabled="saving"
        @update:model-value="(value: boolean | 'indeterminate') => toggle(channel.id, value === true)"
      >
        <template #label="{ label }">
          <span class="inline-flex items-center gap-1.5">
            <UIcon :name="channelIcon(channel)" class="size-4 shrink-0" style="color: var(--muted)" />
            {{ label }}
          </span>
        </template>
      </UCheckbox>
    </div>
  </section>
</template>
