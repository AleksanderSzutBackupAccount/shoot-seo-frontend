<script setup lang="ts">
const { t } = useI18n()
useHead({ title: t('posts.newPageTitle') })
</script>

<template>
  <PostForm mode="create" />
</template>
