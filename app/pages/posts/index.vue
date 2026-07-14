<script setup lang="ts">
import type { DropdownMenuItem, TableColumn } from '@nuxt/ui'
import type { Channel, PostStatus, PostSummary, Publication } from '~~/shared/types/api'

useHead({ title: 'Treści — Shut SEO' })

const { current } = useWorkspace()
const { list, publish, unpublish, remove } = usePosts()
const { list: listPublications } = usePublications()
const { list: listChannels } = useChannels()
const toast = useToast()

const { data: posts, status: loadStatus, refresh } = await useAsyncData(
  'posts',
  () => list(),
  { watch: [() => current.value?.id], default: () => [] as PostSummary[] },
)

// Per-channel distribution badges (M3) — best-effort: the posts list itself
// doesn't carry publication data, so we fetch it alongside and index client-side.
const { data: publications } = await useAsyncData(
  'posts-publications',
  () => listPublications(),
  { watch: [() => current.value?.id], default: () => [] as Publication[] },
)
const { data: channels } = await useAsyncData(
  'posts-channels',
  () => listChannels(),
  { watch: [() => current.value?.id], default: () => [] as Channel[] },
)

/** Static labels for the social channel types a post can be distributed to. */
const CHANNEL_LABELS: Partial<Record<Channel['type'], string>> = {
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
}

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

function publicationsFor(postId: string): Publication[] {
  return publicationsByPost.value.get(postId) ?? []
}

function channelLabel(channelId: string): string {
  const channel = channelsById.value.get(channelId)
  if (!channel) return '—'
  return CHANNEL_LABELS[channel.type] ?? channel.name
}

const statusMeta: Record<PostStatus, { label: string, cls: string }> = {
  draft: { label: 'Szkic', cls: 'chip--draft' },
  scheduled: { label: 'Zaplanowany', cls: 'chip--scheduled' },
  published: { label: 'Opublikowany', cls: 'chip--published' },
}

const columns: TableColumn<PostSummary>[] = [
  { accessorKey: 'title', header: 'Tytuł' },
  { accessorKey: 'status', header: 'Status' },
  { id: 'date', header: 'Data' },
  { accessorKey: 'updated_at', header: 'Aktualizacja' },
  { id: 'channels', header: 'Kanały' },
  { id: 'actions', header: '' },
]

const busyId = ref<string | null>(null)
const removeTarget = ref<PostSummary | null>(null)
const removing = ref(false)

function formatDate(value: string | null): string {
  if (!value) return '—'
  return new Date(value).toLocaleString('pl-PL', { dateStyle: 'medium', timeStyle: 'short' })
}

function rowDate(post: PostSummary): string {
  if (post.status === 'published') return `Publikacja: ${formatDate(post.published_at)}`
  if (post.status === 'scheduled') return `Plan: ${formatDate(post.scheduled_at)}`
  return '—'
}

async function togglePublish(post: PostSummary) {
  busyId.value = post.id
  try {
    if (post.status === 'published') {
      await unpublish(post.id)
      toast.add({ title: 'Cofnięto publikację', color: 'success' })
    }
    else {
      await publish(post.id)
      toast.add({ title: 'Opublikowano wpis', color: 'success' })
    }
    await refresh()
  }
  catch (err) {
    toast.add({ title: parseApiError(err).message, color: 'error' })
  }
  finally {
    busyId.value = null
  }
}

function rowMenu(post: PostSummary): DropdownMenuItem[][] {
  return [[
    { label: 'Edytuj', icon: 'i-lucide-pencil', to: `/posts/${post.id}` },
    post.status === 'published'
      ? { label: 'Cofnij publikację', icon: 'i-lucide-undo-2', onSelect: () => togglePublish(post) }
      : { label: 'Opublikuj', icon: 'i-lucide-send', onSelect: () => togglePublish(post) },
  ], [
    { label: 'Usuń', icon: 'i-lucide-trash-2', color: 'error', onSelect: () => { removeTarget.value = post } },
  ]]
}

async function confirmRemove() {
  if (!removeTarget.value) return
  removing.value = true
  try {
    await remove(removeTarget.value.id)
    toast.add({ title: 'Usunięto wpis', color: 'success' })
    removeTarget.value = null
    await refresh()
  }
  catch (err) {
    toast.add({ title: parseApiError(err).message, color: 'error' })
  }
  finally {
    removing.value = false
  }
}
</script>

<template>
  <div>
    <AppPageHeader
      eyebrow="Treści"
      title="Wszystkie wpisy"
      :description="`Twórz, planuj i publikuj treści w workspace „${current?.name ?? '—'}”.`"
    >
      <template #actions>
        <UButton to="/posts/new" color="neutral" icon="i-lucide-plus" size="lg">Nowy wpis</UButton>
      </template>
    </AppPageHeader>

    <AppEmptyState
      v-if="loadStatus !== 'pending' && (posts?.length ?? 0) === 0"
      icon="i-lucide-file-text"
      title="Jeszcze pusto"
      description="Nie masz jeszcze żadnych wpisów. Zacznij od pierwszego — z asystą AI napiszesz go w kilka minut."
    >
      <template #action>
        <UButton to="/posts/new" color="neutral" icon="i-lucide-plus">Utwórz wpis</UButton>
      </template>
    </AppEmptyState>

    <div v-else class="u-card overflow-hidden">
      <UTable
        class="posts-table"
        :data="posts ?? []"
        :columns="columns"
        :loading="loadStatus === 'pending'"
        :ui="{ tbody: 'divide-y divide-[var(--hairline-soft)]' }"
      >
        <template #title-cell="{ row }">
          <div class="flex min-w-0 items-center gap-3">
            <img
              v-if="row.original.main_image_url"
              :src="row.original.main_image_url"
              :alt="row.original.title"
              class="size-10 shrink-0 rounded-lg object-cover"
              style="border: 1px solid var(--hairline)"
            >
            <div
              v-else
              class="flex size-10 shrink-0 items-center justify-center rounded-lg"
              style="background: var(--surface-strong); color: var(--muted)"
            >
              <UIcon name="i-lucide-file-text" class="size-4" />
            </div>
            <div class="min-w-0">
              <NuxtLink
                :to="`/posts/${row.original.id}`"
                class="post-title block truncate font-medium"
                style="color: var(--ink)"
              >
                {{ row.original.title }}
              </NuxtLink>
              <span class="block truncate text-xs" style="color: var(--muted-soft)">/{{ row.original.slug }}</span>
            </div>
          </div>
        </template>

        <template #status-cell="{ row }">
          <span class="chip" :class="statusMeta[row.original.status].cls">
            {{ statusMeta[row.original.status].label }}
          </span>
        </template>

        <template #date-cell="{ row }">
          <span class="text-sm" style="color: var(--muted)">{{ rowDate(row.original) }}</span>
        </template>

        <template #updated_at-cell="{ row }">
          <span class="text-sm" style="color: var(--muted)">{{ formatDate(row.original.updated_at) }}</span>
        </template>

        <template #channels-cell="{ row }">
          <div v-if="publicationsFor(row.original.id).length" class="flex flex-wrap gap-1.5">
            <UBadge
              v-for="pub in publicationsFor(row.original.id)"
              :key="pub.id"
              :label="channelLabel(pub.channel_id)"
              :color="publicationStatusMeta[pub.status].color"
              variant="subtle"
              size="sm"
            />
          </div>
          <span v-else class="text-sm" style="color: var(--muted-soft)">—</span>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex justify-end">
            <UDropdownMenu :items="rowMenu(row.original)">
              <UButton
                icon="i-lucide-ellipsis-vertical"
                color="neutral"
                variant="ghost"
                size="sm"
                :loading="busyId === row.original.id"
                aria-label="Akcje"
              />
            </UDropdownMenu>
          </div>
        </template>
      </UTable>
    </div>

    <UModal
      :open="removeTarget !== null"
      title="Usunąć wpis?"
      :description="`Czy na pewno chcesz usunąć „${removeTarget?.title}”? Tej operacji nie można cofnąć.`"
      @update:open="(value: boolean) => { if (!value) removeTarget = null }"
    >
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton color="neutral" variant="ghost" @click="removeTarget = null">Anuluj</UButton>
          <UButton color="error" :loading="removing" @click="confirmRemove">Usuń</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<style scoped>
.posts-table :deep(thead th) {
  padding: 0.85rem 1.25rem;
  text-align: left;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--muted);
  border-bottom: 1px solid var(--hairline);
}
.posts-table :deep(tbody td) {
  padding: 0.85rem 1.25rem;
  vertical-align: middle;
  color: var(--body);
}
.posts-table :deep(tbody tr) {
  transition: background-color 0.15s ease;
}
.posts-table :deep(tbody tr:hover) {
  background: var(--surface-strong);
}
.post-title:hover {
  text-decoration: underline;
  text-underline-offset: 3px;
}
</style>
