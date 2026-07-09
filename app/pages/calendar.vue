<script setup lang="ts">
import type { CalendarEntry } from '~~/shared/types/api'

useHead({ title: 'Kalendarz — Shut SEO' })

const { current } = useWorkspace()
const { fetchCalendar } = usePosts()

const now = new Date()
const month = ref(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)

const { data: entries, status } = await useAsyncData(
  'calendar',
  () => fetchCalendar(month.value),
  { watch: [month, () => current.value?.id], default: () => [] as CalendarEntry[] },
)
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
      @month-change="month = $event"
    />
  </div>
</template>
