<script setup lang="ts">
import type { Post } from '~~/shared/types/api'

const route = useRoute()
const id = computed(() => route.params.id as string)

const { current } = useWorkspace()
const { get } = usePosts()

const { data: post, status, error } = await useAsyncData(
  () => `post-${id.value}`,
  () => get(id.value),
  { watch: [id, () => current.value?.id] },
)

const title = computed(() => post.value?.title ?? 'Wpis')
useHead({ title: () => `${title.value} — Shut SEO` })
</script>

<template>
  <div>
    <div v-if="status === 'pending'" class="flex justify-center py-24">
      <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin" style="color: var(--muted)" />
    </div>

    <AppEmptyState
      v-else-if="error || !post"
      icon="i-lucide-file-x"
      title="Nie znaleziono wpisu"
      description="Wpis nie istnieje lub nie należy do bieżącego workspace."
    >
      <template #action>
        <UButton to="/posts" icon="i-lucide-arrow-left" color="neutral" variant="outline">Wróć do treści</UButton>
      </template>
    </AppEmptyState>

    <PostForm
      v-else
      :id="id"
      mode="edit"
      :initial="post as Post"
    />
  </div>
</template>
