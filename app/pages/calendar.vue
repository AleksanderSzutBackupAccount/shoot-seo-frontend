<script setup lang="ts">
import type { CalendarEntry, Channel, Publication } from '~~/shared/types/api'

const { t } = useI18n()
useHead({ title: () => t('calendar.pageTitle') })

const { current } = useWorkspace()
const { fetchCalendar } = usePosts()
const { list: listPublications } = usePublications()
const { list: listChannels } = useChannels()

const now = new Date()
const month = ref(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)

const calendarQuery = useAsyncData(
  'calendar',
  () => fetchCalendar(month.value),
  { watch: [month, () => current.value?.id], default: () => [] as CalendarEntry[] },
)

// Per-channel distribution badges (M3) — the calendar feed itself has no
// publication data, so we fetch it alongside and index client-side.
const publicationsQuery = useAsyncData(
  'calendar-publications',
  () => listPublications(),
  { watch: [() => current.value?.id], default: () => [] as Publication[] },
)
const channelsQuery = useAsyncData(
  'calendar-channels',
  () => listChannels(),
  { watch: [() => current.value?.id], default: () => [] as Channel[] },
)

await Promise.all([calendarQuery, publicationsQuery, channelsQuery])

const { data: entries, status } = calendarQuery
const { data: publications } = publicationsQuery
const { data: channels } = channelsQuery

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
      :eyebrow="$t('calendar.eyebrow')"
      :title="$t('calendar.title')"
      :description="$t('calendar.description', { workspace: current?.name ?? '—' })"
    >
      <template #actions>
        <UButton to="/posts/new" color="neutral" icon="i-lucide-plus" size="lg">{{ $t('common.newPost') }}</UButton>
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
