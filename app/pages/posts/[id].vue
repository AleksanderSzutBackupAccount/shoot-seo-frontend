<script setup lang="ts">
import type { Post } from '~~/shared/types/api'

const route = useRoute()
const id = computed(() => route.params.id as string)

const { current } = useWorkspace()
const { get } = usePosts()
const { t } = useI18n()

const { data: post, status, error } = await useAsyncData(
  () => `post-${id.value}`,
  () => get(id.value),
  { watch: [id, () => current.value?.id] },
)

const title = computed(() => post.value?.title ?? t('posts.defaultTitle'))
useHead({ title: () => t('posts.editPageTitle', { title: title.value }) })
</script>

<template>
  <div>
    <div v-if="status === 'pending'" class="flex justify-center py-24">
      <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin" style="color: var(--muted)" />
    </div>

    <AppEmptyState
      v-else-if="error || !post"
      icon="i-lucide-file-x"
      :title="$t('posts.notFoundTitle')"
      :description="$t('posts.notFoundDescription')"
    >
      <template #action>
        <UButton to="/posts" icon="i-lucide-arrow-left" color="neutral" variant="outline">{{ $t('posts.backToPosts') }}</UButton>
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
