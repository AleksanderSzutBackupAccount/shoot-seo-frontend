<script setup lang="ts">
// Styled, dependency-free code block with a copy button. Reuses the app's
// clipboard/toast pattern (see RevealSecret.vue).
const props = defineProps<{ code: string, lang?: string }>()
const toast = useToast()
const { t } = useI18n()
const copied = ref(false)

async function copy() {
  try {
    await navigator.clipboard.writeText(props.code)
    copied.value = true
    toast.add({ title: t('common.copiedToClipboard'), color: 'success', icon: 'i-lucide-check' })
    setTimeout(() => (copied.value = false), 2000)
  }
  catch {
    toast.add({ title: t('common.copyFailed'), color: 'error' })
  }
}
</script>

<template>
  <div class="code-block">
    <div class="code-block__bar">
      <span class="code-block__lang">{{ lang }}</span>
      <UButton
        :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
        color="neutral"
        variant="ghost"
        size="xs"
        aria-label="Copy code"
        @click="copy"
      />
    </div>
    <pre><code>{{ code }}</code></pre>
  </div>
</template>

<style scoped>
.code-block {
  border: 1px solid var(--hairline);
  border-radius: 12px;
  background: var(--surface-strong);
  overflow: hidden;
}
.code-block__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 2.25rem;
  padding: 0.25rem 0.5rem 0.25rem 0.9rem;
  border-bottom: 1px solid var(--hairline);
}
.code-block__lang {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
}
.code-block pre {
  margin: 0;
  padding: 1rem 1.1rem;
  overflow-x: auto;
}
.code-block code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.8125rem;
  line-height: 1.6;
  color: var(--ink);
  white-space: pre;
}
</style>
