<script setup lang="ts">
import type { DateValue } from '@internationalized/date'
import type { CalendarEntry, PostStatus } from '~~/shared/types/api'

const props = defineProps<{
  posts: CalendarEntry[]
  loading?: boolean
}>()

const emit = defineEmits<{
  monthChange: [month: string]
}>()

const selected = ref<DateValue>()

// Structural param avoids the nominal (`#private`) DateValue mismatch; every
// calendar value exposes numeric `year`/`month`. Emits the visible `YYYY-MM`.
function onPlaceholder(value: { year: number, month: number }) {
  emit('monthChange', `${value.year}-${String(value.month).padStart(2, '0')}`)
}

const statusMeta: Record<PostStatus, { label: string, chip: string, dot: string }> = {
  draft: { label: 'Szkic', chip: 'chip--draft', dot: 'cal-dot--draft' },
  scheduled: { label: 'Zaplanowany', chip: 'chip--scheduled', dot: 'cal-dot--scheduled' },
  published: { label: 'Opublikowany', chip: 'chip--published', dot: 'cal-dot--published' },
}

// Stable priority order for the day-cell status dots.
const statusOrder: PostStatus[] = ['published', 'scheduled', 'draft']

const postsByDate = computed(() => {
  const map = new Map<string, CalendarEntry[]>()
  for (const post of props.posts) {
    if (!post.date) continue
    const key = post.date.slice(0, 10) // YYYY-MM-DD
    const bucket = map.get(key)
    if (bucket) bucket.push(post)
    else map.set(key, [post])
  }
  return map
})

function keyFor(date: DateValue): string {
  return `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`
}

function postsForDate(date: DateValue | undefined): CalendarEntry[] {
  if (!date) return []
  return postsByDate.value.get(keyFor(date)) ?? []
}

// Unique statuses present on a day, in stable priority order (for the dots).
function statusesForDate(date: DateValue): PostStatus[] {
  const present = new Set(postsForDate(date).map(p => p.status))
  return statusOrder.filter(s => present.has(s))
}

function formatSelected(date: DateValue): string {
  return `${String(date.day).padStart(2, '0')}.${String(date.month).padStart(2, '0')}.${date.year}`
}
</script>

<template>
  <div class="grid items-start gap-5 lg:grid-cols-[auto_1fr]">
    <!-- Calendar surface -->
    <div class="u-card flex flex-col items-center p-4 sm:p-6">
      <UCalendar
        v-model="selected"
        color="neutral"
        variant="solid"
        :week-starts-on="1"
        :ui="{
          cellTrigger: 'flex-col gap-1 size-11 rounded-[10px]',
          headCell: 'text-[11px] font-semibold uppercase tracking-wider',
        }"
        @update:placeholder="onPlaceholder"
      >
        <template #heading="{ value }">
          <span class="font-display text-xl" style="color: var(--ink)">{{ value }}</span>
        </template>

        <template #day="{ day }">
          <span class="leading-none">{{ day.day }}</span>
          <span v-if="statusesForDate(day).length" class="cal-dots">
            <span
              v-for="s in statusesForDate(day)"
              :key="s"
              class="cal-dot"
              :class="statusMeta[s].dot"
            />
          </span>
        </template>
      </UCalendar>

      <div
        class="mt-4 flex items-center justify-center gap-5 pt-4 text-xs"
        style="width: 100%; border-top: 1px solid var(--hairline-soft); color: var(--muted)"
      >
        <span class="inline-flex items-center gap-1.5"><span class="cal-dot cal-dot--published" />Opublikowane</span>
        <span class="inline-flex items-center gap-1.5"><span class="cal-dot cal-dot--scheduled" />Zaplanowane</span>
      </div>
    </div>

    <!-- Entries for the selected day -->
    <div class="u-card overflow-hidden">
      <div class="flex items-center gap-2.5 px-5 py-4" style="border-bottom: 1px solid var(--hairline)">
        <UIcon name="i-lucide-calendar-days" class="size-[18px]" style="color: var(--muted)" />
        <h3 style="font-weight: 600; color: var(--ink)">
          <template v-if="selected">Publikacje · {{ formatSelected(selected) }}</template>
          <template v-else>Wybierz dzień</template>
        </h3>
      </div>

      <div class="p-5">
        <div v-if="loading" class="flex justify-center py-8">
          <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin" style="color: var(--muted)" />
        </div>

        <template v-else-if="selected">
          <ul v-if="postsForDate(selected).length" class="-mx-2 space-y-0.5">
            <li v-for="post in postsForDate(selected)" :key="post.id">
              <NuxtLink
                :to="`/posts/${post.id}`"
                class="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-[var(--surface-strong)]"
              >
                <span class="min-w-0 flex-1 truncate text-[15px]" style="color: var(--ink); font-weight: 500">{{ post.title }}</span>
                <span class="chip shrink-0" :class="statusMeta[post.status].chip">{{ statusMeta[post.status].label }}</span>
              </NuxtLink>
            </li>
          </ul>
          <p v-else class="py-4 text-sm" style="color: var(--muted)">Brak publikacji tego dnia.</p>
        </template>

        <p v-else class="py-4 text-sm" style="color: var(--muted)">
          Kliknij dzień w kalendarzu, aby zobaczyć zaplanowane i opublikowane wpisy.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cal-dots {
  display: flex;
  gap: 2px;
}
.cal-dot {
  width: 5px;
  height: 5px;
  border-radius: 9999px;
  flex-shrink: 0;
}
.cal-dot--published { background: #3f9f7f; }
.cal-dot--scheduled { background: #cf8a4c; }
.cal-dot--draft { background: var(--muted-soft); }
</style>
