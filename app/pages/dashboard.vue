<script setup lang="ts">
const { t } = useI18n()
useHead({ title: () => t('dashboard.pageTitle') })

const { user } = useAuth()
const { current } = useWorkspace()
const { list } = usePosts()

const { data: posts } = await useAsyncData('dashboard-posts', async () => {
  try {
    return await list()
  }
  catch {
    return []
  }
}, { default: () => [] })

const stats = computed(() => {
  const all = posts.value ?? []
  return {
    total: all.length,
    published: all.filter(p => p.status === 'published').length,
    scheduled: all.filter(p => p.status === 'scheduled').length,
  }
})

const recent = computed(() => (posts.value ?? []).slice(0, 5))

const statusMeta = computed<Record<string, { label: string, cls: string }>>(() => ({
  published: { label: t('common.statusPublished'), cls: 'chip--published' },
  scheduled: { label: t('common.statusScheduled'), cls: 'chip--scheduled' },
  draft: { label: t('common.statusDraft'), cls: 'chip--draft' },
}))

const greeting = computed(() => {
  const n = user.value?.name?.split(' ')[0]
  return n ? t('dashboard.greetingName', { name: n }) : t('dashboard.greeting')
})
</script>

<template>
  <div>
    <AppPageHeader
      :eyebrow="$t('dashboard.eyebrow')"
      :title="greeting"
      :description="$t('dashboard.description')"
    >
      <template #actions>
        <UButton to="/posts/new" color="neutral" icon="i-lucide-plus" size="lg">{{ $t('common.newPost') }}</UButton>
      </template>
    </AppPageHeader>

    <!-- Workspace hero + stats -->
    <div class="grid gap-5 lg:grid-cols-3">
      <div class="relative overflow-hidden rounded-2xl p-7 lg:row-span-1" style="background: var(--canvas-soft); border: 1px solid var(--hairline)">
        <AppGradientOrbs variant="corner" />
        <div class="relative z-10">
          <p class="eyebrow">{{ $t('dashboard.activeWorkspace') }}</p>
          <p class="card-title mt-3">{{ current?.name ?? '—' }}</p>
          <div v-if="current" class="mt-4">
            <span class="badge-pill">{{ current.role === 'admin' ? $t('dashboard.roleAdmin') : $t('dashboard.roleUser') }}</span>
          </div>
        </div>
      </div>

      <div class="u-card u-card--hover p-7">
        <p class="eyebrow">{{ $t('dashboard.contentEyebrow') }}</p>
        <p class="font-display mt-4 leading-none" style="font-size: 2.75rem; color: var(--ink)">{{ stats.total }}</p>
        <p class="mt-2 text-sm" style="color: var(--muted)">{{ $t('dashboard.totalPostsLabel') }}</p>
      </div>

      <div class="grid grid-cols-2 gap-5">
        <div class="u-card u-card--hover p-6">
          <p class="eyebrow">Live</p>
          <p class="font-display mt-3 leading-none" style="font-size: 2.25rem; color: var(--ink)">{{ stats.published }}</p>
          <p class="mt-2 text-sm" style="color: var(--muted)">{{ $t('dashboard.publishedLabel') }}</p>
        </div>
        <div class="u-card u-card--hover p-6">
          <p class="eyebrow">{{ $t('dashboard.queueEyebrow') }}</p>
          <p class="font-display mt-3 leading-none" style="font-size: 2.25rem; color: var(--ink)">{{ stats.scheduled }}</p>
          <p class="mt-2 text-sm" style="color: var(--muted)">{{ $t('dashboard.scheduledLabel') }}</p>
        </div>
      </div>
    </div>

    <!-- Recent + quick actions -->
    <div class="mt-5 grid gap-5 lg:grid-cols-3">
      <div class="u-card overflow-hidden lg:col-span-2">
        <div class="flex items-center justify-between px-6 py-5" style="border-bottom: 1px solid var(--hairline)">
          <h2 style="font-weight: 600; color: var(--ink)">{{ $t('dashboard.recentTitle') }}</h2>
          <UButton to="/posts" variant="link" color="neutral" trailing-icon="i-lucide-arrow-right" size="sm">{{ $t('dashboard.viewAll') }}</UButton>
        </div>

        <div v-if="recent.length" class="divide-y" style="--tw-divide-opacity: 1">
          <NuxtLink
            v-for="post in recent"
            :key="post.id"
            :to="`/posts/${post.id}`"
            class="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-[var(--surface-strong)]"
            style="border-top: 1px solid var(--hairline-soft)"
          >
            <span class="min-w-0 truncate" style="color: var(--ink); font-weight: 500">{{ post.title }}</span>
            <span class="chip shrink-0" :class="statusMeta[post.status]?.cls">{{ statusMeta[post.status]?.label ?? post.status }}</span>
          </NuxtLink>
        </div>

        <div v-else class="px-6 py-14 text-center">
          <p class="card-title" style="font-size: 1.25rem">{{ $t('common.emptyTitle') }}</p>
          <p class="mx-auto mt-2 max-w-sm text-[15px]" style="color: var(--muted)">
            {{ $t('dashboard.emptyDescription') }}
          </p>
          <UButton to="/posts/new" color="neutral" icon="i-lucide-plus" class="mt-5">{{ $t('common.createPost') }}</UButton>
        </div>
      </div>

      <div class="u-card p-6">
        <h2 class="mb-4" style="font-weight: 600; color: var(--ink)">{{ $t('dashboard.quickActionsTitle') }}</h2>
        <div class="flex flex-col gap-2.5">
          <NuxtLink to="/posts/new" class="quick-action">
            <UIcon name="i-lucide-pen-line" class="size-[18px]" />
            <span>{{ $t('dashboard.quickActionWrite') }}</span>
            <UIcon name="i-lucide-arrow-up-right" class="ml-auto size-4 opacity-40" />
          </NuxtLink>
          <NuxtLink to="/calendar" class="quick-action">
            <UIcon name="i-lucide-calendar-days" class="size-[18px]" />
            <span>{{ $t('dashboard.quickActionSchedule') }}</span>
            <UIcon name="i-lucide-arrow-up-right" class="ml-auto size-4 opacity-40" />
          </NuxtLink>
          <NuxtLink to="/media" class="quick-action">
            <UIcon name="i-lucide-image" class="size-[18px]" />
            <span>{{ $t('dashboard.quickActionMedia') }}</span>
            <UIcon name="i-lucide-arrow-up-right" class="ml-auto size-4 opacity-40" />
          </NuxtLink>
          <NuxtLink to="/members" class="quick-action">
            <UIcon name="i-lucide-user-plus" class="size-[18px]" />
            <span>{{ $t('dashboard.quickActionInvite') }}</span>
            <UIcon name="i-lucide-arrow-up-right" class="ml-auto size-4 opacity-40" />
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.quick-action {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.7rem 0.85rem;
  border-radius: 12px;
  border: 1px solid var(--hairline);
  color: var(--ink);
  font-size: 15px;
  font-weight: 500;
  transition: background 0.18s ease, border-color 0.18s ease;
}
.quick-action:hover {
  background: var(--surface-strong);
  border-color: var(--hairline-strong);
}
</style>
