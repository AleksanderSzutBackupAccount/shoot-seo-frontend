<script setup lang="ts">
import type { AiAnalysis } from '~~/shared/types/api'

// Inline AI actions row for the post editor (M4): generate a draft, polish the
// current content, or run a readability/SEO analysis. Emits the result back to
// the parent instead of writing into the post form directly.
const props = defineProps<{ content: string }>()
const emit = defineEmits<{ insert: [text: string], analysis: [payload: AiAnalysis] }>()

const { generate, improve, analyze } = useAi()
const toast = useToast()
const busy = ref(false)

async function run<T>(fn: () => Promise<T>, onOk: (r: T) => void) {
  busy.value = true
  try {
    onOk(await fn())
  }
  catch (e: unknown) {
    const status = (e as { statusCode?: number }).statusCode
    toast.add({ title: status === 429 ? 'Wyczerpano limit AI dla tego okresu.' : 'Akcja AI nie powiodła się.', color: 'error' })
  }
  finally {
    busy.value = false
  }
}

const topic = ref('')
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <UInput v-model="topic" placeholder="Temat draftu…" size="sm" class="w-48" />
    <UButton size="sm" :loading="busy" @click="run(() => generate({ variant: 'draft', topic }), r => emit('insert', r.text))">
      Generuj draft
    </UButton>
    <UButton size="sm" variant="soft" :loading="busy" :disabled="!props.content" @click="run(() => improve({ fragment: props.content, instruction: 'zwięźlej' }), r => emit('insert', r.text))">
      Popraw
    </UButton>
    <UButton size="sm" variant="soft" :loading="busy" :disabled="!props.content" @click="run(() => analyze({ content: props.content }), r => emit('analysis', r))">
      Analiza
    </UButton>
  </div>
</template>
