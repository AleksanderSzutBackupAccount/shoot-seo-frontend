<script setup lang="ts">
import type { Media } from '~~/shared/types/api'

const { t } = useI18n()
useHead({ title: () => t('media.pageTitle') })

const { current } = useWorkspace()
const { list, upload } = useMedia()
const toast = useToast()

const { data: media, status, refresh } = await useAsyncData(
  'media',
  () => list(),
  { watch: [() => current.value?.id], default: () => [] as Media[] },
)

const uploading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

function triggerUpload() {
  fileInput.value?.click()
}

async function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  input.value = ''
  if (!files.length) return
  uploading.value = true
  try {
    for (const file of files) {
      await upload(file)
    }
    toast.add({ title: files.length > 1 ? t('media.toastUploadedMultiple') : t('media.toastUploadedSingle'), color: 'success' })
    await refresh()
  }
  catch (err) {
    toast.add({ title: parseApiError(err).message, color: 'error' })
  }
  finally {
    uploading.value = false
  }
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

async function copyUrl(url: string) {
  try {
    await navigator.clipboard.writeText(url)
    toast.add({ title: t('media.toastCopiedUrl'), color: 'success' })
  }
  catch {
    toast.add({ title: t('common.copyFailed'), color: 'error' })
  }
}
</script>

<template>
  <div>
    <AppPageHeader
      :eyebrow="$t('nav.media')"
      :title="$t('media.libraryTitle')"
      :description="$t('media.description', { workspace: current?.name ?? '—' })"
    >
      <template #actions>
        <UButton color="neutral" icon="i-lucide-upload" size="lg" :loading="uploading" @click="triggerUpload">
          {{ $t('media.upload') }}
        </UButton>
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          multiple
          class="hidden"
          @change="onFileChange"
        >
      </template>
    </AppPageHeader>

    <div v-if="status === 'pending'" class="flex justify-center py-20">
      <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin" style="color: var(--muted)" />
    </div>

    <AppEmptyState
      v-else-if="!media || media.length === 0"
      icon="i-lucide-image-off"
      :title="$t('media.emptyTitle')"
      :description="$t('media.emptyDescription')"
    >
      <template #action>
        <UButton color="neutral" icon="i-lucide-upload" :loading="uploading" @click="triggerUpload">{{ $t('media.uploadFile') }}</UButton>
      </template>
    </AppEmptyState>

    <div v-else class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      <div
        v-for="item in media"
        :key="item.id"
        class="u-card u-card--hover group overflow-hidden"
      >
        <div class="relative aspect-square" style="background: var(--surface-strong)">
          <img :src="item.url" :alt="item.id" class="h-full w-full object-cover">
          <div
            class="absolute inset-0 flex items-center justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100"
            style="background: color-mix(in srgb, var(--ink) 44%, transparent)"
          >
            <UButton
              icon="i-lucide-copy"
              color="neutral"
              size="sm"
              :aria-label="$t('media.copyUrl')"
              @click="copyUrl(item.url)"
            />
            <UButton
              icon="i-lucide-external-link"
              color="neutral"
              size="sm"
              :to="item.url"
              target="_blank"
              :aria-label="$t('media.open')"
            />
          </div>
        </div>
        <div class="px-3 py-2.5">
          <p class="truncate text-xs" style="color: var(--body); font-weight: 500">{{ item.mime }}</p>
          <p class="mt-0.5 text-xs" style="color: var(--muted)">{{ formatSize(item.size) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
