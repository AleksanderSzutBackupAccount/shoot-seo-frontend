<script setup lang="ts">
import type { Media } from '~~/shared/types/api'

useHead({ title: 'Media — Shoot SEO' })

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
    toast.add({ title: files.length > 1 ? 'Przesłano pliki' : 'Przesłano plik', color: 'success' })
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
    toast.add({ title: 'Skopiowano URL', color: 'success' })
  }
  catch {
    toast.add({ title: 'Nie udało się skopiować', color: 'error' })
  }
}
</script>

<template>
  <div>
    <AppPageHeader
      eyebrow="Media"
      title="Biblioteka mediów"
      :description="`Pliki i grafiki workspace „${current?.name ?? '—'}” — gotowe do użycia we wpisach.`"
    >
      <template #actions>
        <UButton color="neutral" icon="i-lucide-upload" size="lg" :loading="uploading" @click="triggerUpload">
          Prześlij
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
      title="Brak mediów"
      description="Prześlij pierwszy plik, aby wykorzystać go we wpisach."
    >
      <template #action>
        <UButton color="neutral" icon="i-lucide-upload" :loading="uploading" @click="triggerUpload">Prześlij plik</UButton>
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
              aria-label="Kopiuj URL"
              @click="copyUrl(item.url)"
            />
            <UButton
              icon="i-lucide-external-link"
              color="neutral"
              size="sm"
              :to="item.url"
              target="_blank"
              aria-label="Otwórz"
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
