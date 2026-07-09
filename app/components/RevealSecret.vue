<script setup lang="ts">
// One-time reveal of a sensitive value (API key plaintext / webhook secret).
// The value lives only in this component's props for the lifetime of the modal;
// it is never persisted or refetched.
const props = defineProps<{ value: string, label?: string }>()
const toast = useToast()
const copied = ref(false)

async function copy() {
  try {
    await navigator.clipboard.writeText(props.value)
    copied.value = true
    toast.add({ title: 'Skopiowano do schowka', color: 'success', icon: 'i-lucide-check' })
  }
  catch {
    toast.add({ title: 'Nie udało się skopiować', color: 'error' })
  }
}
</script>

<template>
  <div class="u-card reveal-card p-5">
    <div class="reveal-warning">
      <UIcon name="i-lucide-shield-alert" class="size-[18px] shrink-0" />
      <p>
        <strong>Skopiuj teraz — nie pokażemy go ponownie.</strong>
        Ta wartość jest widoczna tylko raz, zaraz po utworzeniu. Przechowuj ją bezpiecznie.
      </p>
    </div>

    <p v-if="label" class="field-label mb-1.5 mt-4">{{ label }}</p>
    <div class="reveal-value">
      <code>{{ value }}</code>
      <UButton
        :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
        color="neutral"
        variant="soft"
        size="sm"
        aria-label="Kopiuj wartość"
        @click="copy"
      />
    </div>
  </div>
</template>

<style scoped>
.reveal-card {
  border-color: var(--hairline-strong);
  box-shadow: var(--shadow-soft);
}
.reveal-warning {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.7rem 0.85rem;
  border-radius: 12px;
  background: color-mix(in srgb, var(--orb-peach) 40%, transparent);
  color: #7c3a12;
  font-size: 13px;
  line-height: 1.45;
}
.reveal-warning strong {
  font-weight: 600;
}
.dark .reveal-warning {
  background: color-mix(in srgb, var(--orb-peach) 18%, transparent);
  color: #f4c5a8;
}
.reveal-value {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 0.6rem 0.55rem 0.85rem;
  border-radius: 12px;
  background: var(--surface-strong);
  border: 1px solid var(--hairline);
}
.reveal-value code {
  min-width: 0;
  flex: 1;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 13px;
  line-height: 1.5;
  color: var(--ink);
  word-break: break-all;
}
</style>
