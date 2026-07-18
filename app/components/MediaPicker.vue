<script setup lang="ts">
import type { Media } from '~~/shared/types/api'

const props = defineProps<{
  label?: string
}>()

const model = defineModel<string | null>({ default: null })

const { list, upload } = useMedia()
const toast = useToast()
const { t } = useI18n()

// `props.label` distinguishes "omitted" (undefined -> translated default) from
// an explicit empty string (falsy, hides the label) — see template `v-if`.
const displayLabel = computed(() => props.label ?? t('media.defaultLabel'))

const open = ref(false)
const library = ref<Media[]>([])
const loading = ref(false)
const uploading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

async function loadLibrary() {
  loading.value = true
  try {
    library.value = await list()
  }
  catch (err) {
    toast.add({ title: parseApiError(err).message, color: 'error' })
  }
  finally {
    loading.value = false
  }
}

watch(open, (value) => {
  if (value) loadLibrary()
})

function select(url: string) {
  model.value = url
  open.value = false
}

function clear() {
  model.value = null
}

function triggerUpload() {
  fileInput.value?.click()
}

async function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  uploading.value = true
  try {
    const media = await upload(file)
    library.value = [media, ...library.value]
    select(media.url)
  }
  catch (err) {
    toast.add({ title: parseApiError(err).message, color: 'error' })
  }
  finally {
    uploading.value = false
  }
}
</script>

<template>
  <div class="space-y-2.5">
    <p v-if="displayLabel" class="field-label">{{ displayLabel }}</p>

    <!-- Selected preview -->
    <div v-if="model" class="relative w-full max-w-md">
      <img
        :src="model"
        :alt="$t('media.previewAlt')"
        class="h-48 w-full rounded-xl object-cover"
        style="border: 1px solid var(--hairline)"
      >
      <div class="absolute right-2 top-2 flex gap-1.5">
        <UButton
          icon="i-lucide-replace"
          color="neutral"
          size="xs"
          :aria-label="$t('media.changeImage')"
          @click="open = true"
        />
        <UButton
          icon="i-lucide-x"
          color="error"
          size="xs"
          :aria-label="$t('media.removeImage')"
          @click="clear"
        />
      </div>
    </div>

    <!-- Empty state -->
    <button
      v-else
      type="button"
      class="media-drop"
      @click="open = true"
    >
      <UIcon name="i-lucide-image-plus" class="size-6" />
      <span class="media-drop__label">{{ $t('media.selectImage') }}</span>
      <span class="media-drop__hint">{{ $t('media.selectImageHint') }}</span>
    </button>

    <!-- Picker modal -->
    <UModal v-model:open="open" :title="$t('media.libraryTitle')" :ui="{ content: 'max-w-3xl' }">
      <template #body>
        <div class="space-y-5">
          <div class="flex items-center justify-between gap-3">
            <p class="text-sm" style="color: var(--muted)">{{ $t('media.libraryDescription') }}</p>
            <UButton
              icon="i-lucide-upload"
              color="neutral"
              :loading="uploading"
              @click="triggerUpload"
            >
              {{ $t('media.upload') }}
            </UButton>
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="onFileChange"
            >
          </div>

          <div v-if="loading" class="flex justify-center py-12">
            <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin" style="color: var(--muted)" />
          </div>

          <div
            v-else-if="library.length === 0"
            class="flex flex-col items-center justify-center gap-2 py-12 text-center"
          >
            <UIcon name="i-lucide-image-off" class="size-8" style="color: var(--muted-soft)" />
            <p class="text-sm" style="color: var(--muted)">{{ $t('media.empty') }}</p>
          </div>

          <div v-else class="grid max-h-[50vh] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3 md:grid-cols-4">
            <button
              v-for="item in library"
              :key="item.id"
              type="button"
              class="media-tile"
              :class="{ 'media-tile--active': model === item.url }"
              @click="select(item.url)"
            >
              <img :src="item.url" :alt="item.id" class="h-full w-full object-cover">
              <span v-if="model === item.url" class="media-tile__check">
                <UIcon name="i-lucide-check" class="size-3.5" />
              </span>
            </button>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<style scoped>
.media-drop {
  display: flex;
  width: 100%;
  max-width: 28rem;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 2rem 1rem;
  border: 1px dashed var(--hairline-strong);
  border-radius: 14px;
  color: var(--muted);
  transition: color 0.15s ease, border-color 0.15s ease, background-color 0.15s ease;
}

.media-drop:hover {
  border-color: var(--muted-soft);
  background: var(--surface-strong);
  color: var(--ink);
}

.media-drop:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 2px;
}

.media-drop__label {
  font-size: 0.875rem;
  font-weight: 500;
}

.media-drop__hint {
  font-size: 0.75rem;
  color: var(--muted-soft);
}

.media-tile {
  position: relative;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border: 1px solid var(--hairline);
  border-radius: 12px;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.media-tile:hover {
  border-color: var(--hairline-strong);
}

.media-tile--active {
  border-color: var(--ink);
  box-shadow: 0 0 0 1px var(--ink);
}

.media-tile__check {
  position: absolute;
  top: 0.4rem;
  right: 0.4rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.4rem;
  height: 1.4rem;
  border-radius: 9999px;
  background: var(--ink);
  color: var(--on-primary);
}
</style>
