<script setup lang="ts">
import type { CalendarEntry, Channel, Publication } from '~~/shared/types/api'

useHead({ title: 'Kalendarz — Shut SEO' })

const { current } = useWorkspace()
const { fetchCalendar } = usePosts()
const { list: listPublications } = usePublications()
const { list: listChannels } = useChannels()

const now = new Date()
const month = ref(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)

const { data: entries, status } = await useAsyncData(
  'calendar',
  () => fetchCalendar(month.value),
  { watch: [month, () => current.value?.id], default: () => [] as CalendarEntry[] },
)

// Per-channel distribution badges (M3) — the calendar feed itself has no
// publication data, so we fetch it alongside and index client-side.
const { data: publications } = await useAsyncData(
  'calendar-publications',
  () => listPublications(),
  { watch: [() => current.value?.id], default: () => [] as Publication[] },
)
const { data: channels } = await useAsyncData(
  'calendar-channels',
  () => listChannels(),
  { watch: [() => current.value?.id], default: () => [] as Channel[] },
)

const channelsById = computed(() => {
  const map = new Map<string, Channel>()
  for (const channel of channels.value ?? []) map.set(channel.id, channel)
  return map
})

const publicationsByPost = computed(() => {
  const map = new Map<string, Publication[]>()
  for (const pub of publications.value ?? []) {
    const bucket = map.get(pub.post_id)
    if (bucket) bucket.push(pub)
    else map.set(pub.post_id, [pub])
  }
  return map
})
</script>

<template>
  <div>
    <AppPageHeader
      eyebrow="Planer"
      title="Kalendarz publikacji"
      :description="`Planuj i przeglądaj harmonogram treści workspace „${current?.name ?? '—'}”.`"
    >
      <template #actions>
        <UButton to="/posts/new" color="neutral" icon="i-lucide-plus" size="lg">Nowy wpis</UButton>
      </template>
    </AppPageHeader>

    <PostCalendar
      :posts="entries ?? []"
      :loading="status === 'pending'"
      :publications-by-post="publicationsByPost"
      :channels-by-id="channelsById"
      @month-change="month = $event"
    />
  </div>
</template>
