<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { AiAnalysis, CreatePostPayload, Post, PostStatus, Seo } from '~~/shared/types/api'

const props = withDefaults(defineProps<{
  mode: 'create' | 'edit'
  id?: string
  initial?: Post | null
}>(), {
  id: undefined,
  initial: null,
})

const { create, update, schedule, publish, unpublish } = usePosts()
const toast = useToast()

type Action = 'save' | 'schedule' | 'publish' | 'unpublish'

const schema = z.object({
  title: z.string().min(1, 'Tytuł jest wymagany'),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  main_image_url: z.string().nullable().optional(),
  seo: z.object({
    meta_title: z.string().optional(),
    meta_description: z.string().optional(),
    og_image_url: z.string().optional(),
    canonical_url: z.string().optional(),
  }),
})

type FormState = z.output<typeof schema>

const form = reactive<FormState>({
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  main_image_url: null,
  seo: {
    meta_title: '',
    meta_description: '',
    og_image_url: '',
    canonical_url: '',
  },
})

const status = ref<PostStatus>('draft')
const scheduledAt = ref<string | null>(null)
const publishedAt = ref<string | null>(null)

const formRef = ref()
const loading = ref(false)
const submitError = ref<string | null>(null)
const pendingAction = ref<Action>('save')
const slugEdited = ref(false)

const showScheduleModal = ref(false)
const scheduleAt = ref(toDatetimeLocal(new Date(Date.now() + 60 * 60 * 1000)))

// ---- AI content engine (M4) ----
const aiAnalysis = ref<AiAnalysis | null>(null)

const isCreate = computed(() => props.mode === 'create')

// ---- Populate from an existing post (edit) ----
watch(() => props.initial, (post) => {
  if (!post) return
  form.title = post.title
  form.slug = post.slug
  form.excerpt = post.excerpt ?? ''
  form.content = post.content ?? ''
  form.main_image_url = post.main_image_url
  form.seo.meta_title = post.seo?.meta_title ?? ''
  form.seo.meta_description = post.seo?.meta_description ?? ''
  form.seo.og_image_url = post.seo?.og_image_url ?? ''
  form.seo.canonical_url = post.seo?.canonical_url ?? ''
  status.value = post.status
  scheduledAt.value = post.scheduled_at
  publishedAt.value = post.published_at
  slugEdited.value = !!post.slug
  if (post.scheduled_at) scheduleAt.value = toDatetimeLocal(new Date(post.scheduled_at))
}, { immediate: true })

// ---- Slug auto-generation ----
function slugify(text: string): string {
  const map: Record<string, string> = {
    ą: 'a', ć: 'c', ę: 'e', ł: 'l', ń: 'n', ó: 'o', ś: 's', ż: 'z', ź: 'z',
  }
  return text
    .toLowerCase()
    .split('')
    .map(c => map[c] ?? c)
    .join('')
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

watch(() => form.title, (title) => {
  if (!slugEdited.value) form.slug = slugify(title)
})

function onSlugInput(value: string | number) {
  form.slug = String(value)
  slugEdited.value = true
}

// ---- Datetime helpers ----
function toDatetimeLocal(date: Date): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}

function formatDate(value: string | null): string {
  if (!value) return '—'
  return new Date(value).toLocaleString('pl-PL', { dateStyle: 'medium', timeStyle: 'short' })
}

const statusMeta: Record<PostStatus, { label: string, cls: string }> = {
  draft: { label: 'Szkic', cls: 'chip--draft' },
  scheduled: { label: 'Zaplanowany', cls: 'chip--scheduled' },
  published: { label: 'Opublikowany', cls: 'chip--published' },
}

// ---- Payload ----
function buildPayload(): CreatePostPayload {
  const seo: Seo = {
    meta_title: form.seo.meta_title || null,
    meta_description: form.seo.meta_description || null,
    og_image_url: form.seo.og_image_url || null,
    canonical_url: form.seo.canonical_url || null,
  }
  const hasSeo = Object.values(seo).some(v => v !== null)
  return {
    title: form.title,
    slug: form.slug || undefined,
    excerpt: form.excerpt || null,
    content: form.content || '',
    main_image_url: form.main_image_url ?? null,
    seo: hasSeo ? seo : null,
  }
}

// ---- Actions ----
function trigger(action: Action) {
  pendingAction.value = action
  formRef.value?.submit()
}

function openSchedule() {
  showScheduleModal.value = true
}

function confirmSchedule() {
  showScheduleModal.value = false
  trigger('schedule')
}

async function onSubmit(_event: FormSubmitEvent<FormState>) {
  const action = pendingAction.value
  loading.value = true
  submitError.value = null
  try {
    const saved = props.mode === 'create'
      ? await create(buildPayload())
      : await update(props.id as string, buildPayload())

    if (action === 'schedule') {
      await schedule(saved.id, new Date(scheduleAt.value).toISOString())
    }
    else if (action === 'publish') {
      await publish(saved.id)
    }
    else if (action === 'unpublish') {
      await unpublish(saved.id)
    }

    const messages: Record<Action, string> = {
      save: props.mode === 'create' ? 'Utworzono szkic' : 'Zapisano zmiany',
      schedule: 'Zaplanowano publikację',
      publish: 'Opublikowano wpis',
      unpublish: 'Cofnięto publikację',
    }
    toast.add({ title: messages[action], color: 'success' })
    await navigateTo('/posts')
  }
  catch (err) {
    const parsed = parseApiError(err)
    submitError.value = parsed.message
    formRef.value?.setErrors(parsed.fieldErrors)
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <UForm
    ref="formRef"
    :state="form"
    :schema="schema"
    class="space-y-8"
    @submit="onSubmit"
  >
    <!-- Editorial header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div class="min-w-0">
        <div class="flex items-center gap-2">
          <UButton
            to="/posts"
            icon="i-lucide-arrow-left"
            color="neutral"
            variant="ghost"
            size="sm"
            aria-label="Wróć do treści"
          />
          <p class="eyebrow">{{ isCreate ? 'Nowy wpis' : 'Edytor treści' }}</p>
        </div>
        <h1 class="page-title mt-2">
          {{ isCreate ? 'Nowy wpis' : 'Edytuj wpis' }}
        </h1>
      </div>
      <span
        v-if="!isCreate"
        class="chip shrink-0"
        :class="statusMeta[status].cls"
      >
        {{ statusMeta[status].label }}
      </span>
    </div>

    <UAlert
      v-if="submitError"
      color="error"
      variant="subtle"
      icon="i-lucide-alert-triangle"
      :title="submitError"
    />

    <div class="grid gap-6 lg:grid-cols-3">
      <!-- Main column -->
      <div class="space-y-6 lg:col-span-2">
        <section class="u-card p-6 sm:p-7">
          <h2 class="card-title" style="font-size: 1.25rem">Podstawy</h2>
          <p class="mt-1 text-sm" style="color: var(--muted)">Tytuł, adres URL i krótka zajawka wpisu.</p>
          <div class="mt-5 space-y-4">
            <UFormField label="Tytuł" name="title" required :ui="{ label: 'field-label' }">
              <UInput v-model="form.title" size="lg" class="w-full" placeholder="Tytuł wpisu" />
            </UFormField>

            <UFormField label="Slug" name="slug" help="Generowany z tytułu, edytowalny." :ui="{ label: 'field-label' }">
              <UInput :model-value="form.slug" class="w-full" @update:model-value="onSlugInput" />
            </UFormField>

            <UFormField label="Zajawka (excerpt)" name="excerpt" :ui="{ label: 'field-label' }">
              <UTextarea v-model="form.excerpt" :rows="2" autoresize class="w-full" />
            </UFormField>
          </div>
        </section>

        <section class="u-card p-6 sm:p-7">
          <h2 class="card-title" style="font-size: 1.25rem">Treść</h2>
          <p class="mt-1 text-sm" style="color: var(--muted)">Główna treść wpisu z formatowaniem i obrazami.</p>
          <div class="mt-5 flex flex-wrap items-center justify-between gap-3">
            <AiActions
              :content="form.content ?? ''"
              @insert="(t) => { form.content = (form.content ?? '') + '\n\n' + t }"
              @analysis="(a) => { aiAnalysis = a }"
            />
            <AiUsageMeter />
          </div>
          <UFormField name="content" class="mt-5">
            <ClientOnly>
              <Wysiwyg v-model="form.content" />
              <template #fallback>
                <div
                  class="h-64 animate-pulse rounded-xl"
                  style="border: 1px solid var(--hairline); background: var(--surface-strong)"
                />
              </template>
            </ClientOnly>
          </UFormField>
        </section>

        <section v-if="aiAnalysis" class="u-card p-6 sm:p-7">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-sparkles" class="size-4" style="color: var(--muted)" />
            <h2 class="card-title" style="font-size: 1.25rem">Analiza AI</h2>
          </div>
          <p class="mt-1 text-sm" style="color: var(--muted)">Czytelność: {{ aiAnalysis.analysis.readability.score }}/100</p>
          <div class="mt-4 space-y-4">
            <div v-if="aiAnalysis.analysis.seo.issues.length">
              <p class="field-label mb-1.5">Problemy SEO</p>
              <ul class="list-inside list-disc space-y-1 text-sm" style="color: var(--body)">
                <li v-for="issue in aiAnalysis.analysis.seo.issues" :key="issue">{{ issue }}</li>
              </ul>
            </div>
            <div v-if="aiAnalysis.analysis.gaps.length">
              <p class="field-label mb-1.5">Luki treściowe</p>
              <ul class="list-inside list-disc space-y-1 text-sm" style="color: var(--body)">
                <li v-for="gap in aiAnalysis.analysis.gaps" :key="gap">{{ gap }}</li>
              </ul>
            </div>
          </div>
        </section>

        <section class="u-card p-6 sm:p-7">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-search" class="size-4" style="color: var(--muted)" />
            <h2 class="card-title" style="font-size: 1.25rem">SEO</h2>
          </div>
          <p class="mt-1 text-sm" style="color: var(--muted)">Metadane dla wyszukiwarek i mediów społecznościowych.</p>
          <div class="mt-5 space-y-4">
            <UFormField label="Meta title" name="seo.meta_title" :ui="{ label: 'field-label' }">
              <UInput v-model="form.seo.meta_title" class="w-full" />
            </UFormField>
            <UFormField label="Meta description" name="seo.meta_description" :ui="{ label: 'field-label' }">
              <UTextarea v-model="form.seo.meta_description" :rows="2" autoresize class="w-full" />
            </UFormField>
            <UFormField label="OG image URL" name="seo.og_image_url" :ui="{ label: 'field-label' }">
              <UInput v-model="form.seo.og_image_url" class="w-full" placeholder="https://…" />
            </UFormField>
            <UFormField label="Canonical URL" name="seo.canonical_url" :ui="{ label: 'field-label' }">
              <UInput v-model="form.seo.canonical_url" class="w-full" placeholder="https://…" />
            </UFormField>
          </div>
        </section>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <section class="u-card p-6">
          <h2 class="card-title" style="font-size: 1.25rem">Publikacja</h2>

          <div
            v-if="!isCreate"
            class="mt-4 space-y-2 pb-4"
            style="border-bottom: 1px solid var(--hairline)"
          >
            <div class="flex items-center justify-between gap-2 text-sm">
              <span style="color: var(--muted)">Zaplanowano</span>
              <span style="color: var(--ink)">{{ formatDate(scheduledAt) }}</span>
            </div>
            <div class="flex items-center justify-between gap-2 text-sm">
              <span style="color: var(--muted)">Opublikowano</span>
              <span style="color: var(--ink)">{{ formatDate(publishedAt) }}</span>
            </div>
          </div>

          <div class="mt-4 flex flex-col gap-2">
            <UButton
              block
              color="neutral"
              icon="i-lucide-save"
              :loading="loading && pendingAction === 'save'"
              @click="trigger('save')"
            >
              {{ isCreate ? 'Zapisz szkic' : 'Zapisz zmiany' }}
            </UButton>

            <UButton
              v-if="status !== 'published'"
              block
              color="neutral"
              variant="outline"
              icon="i-lucide-calendar-clock"
              :loading="loading && pendingAction === 'schedule'"
              @click="openSchedule"
            >
              {{ status === 'scheduled' ? 'Zmień termin' : 'Zaplanuj publikację' }}
            </UButton>

            <UButton
              v-if="status !== 'published'"
              block
              color="neutral"
              variant="outline"
              icon="i-lucide-send"
              :loading="loading && pendingAction === 'publish'"
              @click="trigger('publish')"
            >
              Opublikuj teraz
            </UButton>

            <UButton
              v-if="status !== 'draft'"
              block
              color="error"
              variant="ghost"
              icon="i-lucide-undo-2"
              :loading="loading && pendingAction === 'unpublish'"
              @click="trigger('unpublish')"
            >
              Cofnij do szkicu
            </UButton>
          </div>
        </section>

        <PostDistributionPicker v-if="!isCreate" :post-id="(props.id as string)" />
        <section v-else class="u-card p-6">
          <h2 class="card-title" style="font-size: 1.25rem">Dystrybucja</h2>
          <p class="mt-1 text-sm" style="color: var(--muted)">Zapisz post, aby wybrać kanały dystrybucji.</p>
        </section>

        <section class="u-card p-6">
          <h2 class="card-title" style="font-size: 1.25rem">Obraz główny</h2>
          <p class="mt-1 text-sm" style="color: var(--muted)">Wyświetlany na liście wpisów i w nagłówku.</p>
          <UFormField name="main_image_url" class="mt-4">
            <MediaPicker v-model="form.main_image_url" label="" />
          </UFormField>
        </section>
      </div>
    </div>

    <!-- Schedule modal -->
    <UModal v-model:open="showScheduleModal" title="Zaplanuj publikację">
      <template #body>
        <UFormField label="Data i godzina publikacji" :ui="{ label: 'field-label' }">
          <UInput v-model="scheduleAt" type="datetime-local" class="w-full" />
        </UFormField>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton color="neutral" variant="ghost" @click="showScheduleModal = false">Anuluj</UButton>
          <UButton color="neutral" icon="i-lucide-calendar-check" @click="confirmSchedule">Zaplanuj</UButton>
        </div>
      </template>
    </UModal>
  </UForm>
</template>
