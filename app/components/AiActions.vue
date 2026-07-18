<script setup lang="ts">
import type { AiAnalysis } from '~~/shared/types/api'

// Inline AI actions row for the post editor (M4): generate a draft, polish the
// current content, or run a readability/SEO analysis. Emits the result back to
// the parent instead of writing into the post form directly.
const props = defineProps<{ content: string }>()
const emit = defineEmits<{ insert: [text: string], replace: [text: string], analysis: [payload: AiAnalysis] }>()

const { generate, improve, analyze } = useAi()
const toast = useToast()
const { t } = useI18n()

type AiAction = 'generate' | 'improve' | 'analyze'
// Track which action is running so only its button spins (and no two run at once).
const busy = ref<AiAction | null>(null)

async function run<T>(action: AiAction, fn: () => Promise<T>, onOk: (r: T) => void) {
  busy.value = action
  try {
    onOk(await fn())
  }
  catch (e: unknown) {
    const status = (e as { statusCode?: number }).statusCode
    toast.add({ title: status === 429 ? t('editor.aiRateLimitError') : t('editor.aiActionFailed'), color: 'error' })
  }
  finally {
    busy.value = null
  }
}

const topic = ref('')
const anyBusy = computed(() => busy.value !== null)
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <UInput v-model="topic" :placeholder="$t('editor.aiTopicPlaceholder')" size="sm" class="w-48" />
    <UButton
      size="sm"
      :loading="busy === 'generate'"
      :disabled="anyBusy || !topic.trim()"
      @click="run('generate', () => generate({ variant: 'draft', topic }), r => emit('insert', r.text))"
    >
      {{ $t('editor.aiGenerateDraft') }}
    </UButton>
    <UButton
      size="sm"
      variant="soft"
      :loading="busy === 'improve'"
      :disabled="anyBusy || !props.content"
      @click="run('improve', () => improve({ fragment: props.content, instruction: 'zwięźlej' }), r => emit('replace', r.text))"
    >
      {{ $t('editor.aiImprove') }}
    </UButton>
    <UButton
      size="sm"
      variant="soft"
      :loading="busy === 'analyze'"
      :disabled="anyBusy || !props.content"
      @click="run('analyze', () => analyze({ content: props.content }), r => emit('analysis', r))"
    >
      {{ $t('editor.aiAnalyze') }}
    </UButton>
  </div>
</template>
