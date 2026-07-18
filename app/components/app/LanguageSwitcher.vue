<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { LocaleObject } from '@nuxtjs/i18n'

const { locale, locales, setLocale, t } = useI18n()

function selectLocale(code: string) {
  setLocale(code as 'pl' | 'en')
}

const items = computed<DropdownMenuItem[][]>(() => [
  (locales.value as LocaleObject[]).map(l => ({
    label: l.name ?? l.code,
    trailingIcon: l.code === locale.value ? 'i-lucide-check' : undefined,
    onSelect: () => selectLocale(l.code),
  })),
])
</script>

<template>
  <UDropdownMenu :items="items" :ui="{ content: 'w-40' }">
    <UButton
      icon="i-lucide-languages"
      color="neutral"
      variant="ghost"
      :aria-label="t('shell.languageSwitcherLabel')"
    />
  </UDropdownMenu>
</template>
