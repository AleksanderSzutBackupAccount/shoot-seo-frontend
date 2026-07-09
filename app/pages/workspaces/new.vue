<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import * as z from 'zod'

definePageMeta({ layout: 'auth' })
useHead({ title: 'Nowy workspace — Shut SEO' })

const { create, workspaces } = useWorkspace()

const schema = z.object({
  name: z.string().min(1, 'Nazwa jest wymagana').max(120, 'Nazwa jest zbyt długa'),
})
type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({ name: '' })
const form = useTemplateRef('form')
const loading = ref(false)
const serverError = ref<string | null>(null)

const hasWorkspaces = computed(() => workspaces.value.length > 0)

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true
  serverError.value = null
  try {
    await create(event.data.name)
    await navigateTo('/dashboard')
  }
  catch (err) {
    const { message, fieldErrors } = parseApiError(err)
    serverError.value = message
    if (fieldErrors.length) form.value?.setErrors(fieldErrors)
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <div class="mb-8">
      <span class="surface-strong mb-5 flex size-12 items-center justify-center rounded-full">
        <UIcon name="i-lucide-building-2" class="size-5" style="color: var(--ink)" />
      </span>
      <p class="eyebrow mb-3">Onboarding</p>
      <h1 class="card-title">Utwórz workspace</h1>
      <p class="mt-2 text-[15px]" style="color: var(--muted)">
        Workspace to Twoja przestrzeń robocza. Zostaniesz jego administratorem.
      </p>
    </div>

    <UAlert
      v-if="serverError"
      color="error"
      variant="subtle"
      icon="i-lucide-triangle-alert"
      :title="serverError"
      class="mb-5"
    />

    <UForm ref="form" :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
      <UFormField label="Nazwa workspace" name="name">
        <UInput v-model="state.name" placeholder="np. Moja Agencja" icon="i-lucide-building-2" class="w-full" />
      </UFormField>
      <UButton type="submit" size="lg" :loading="loading" class="w-full justify-center">Utwórz workspace</UButton>
    </UForm>

    <p v-if="hasWorkspaces" class="mt-9 text-center text-sm" style="color: var(--muted)">
      <ULink to="/dashboard" class="auth-link auth-link--strong">Wróć do panelu</ULink>
    </p>
  </div>
</template>

<style scoped>
.auth-link {
  color: var(--muted);
  transition: color 0.18s ease;
}
.auth-link:hover {
  color: var(--ink);
}
.auth-link--strong {
  color: var(--ink);
  font-weight: 500;
}
.auth-link--strong:hover {
  text-decoration: underline;
  text-underline-offset: 3px;
}
</style>
