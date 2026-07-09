<script setup lang="ts">
// The global auth middleware handles login/onboarding redirects; authenticated
// users with a workspace land here and are forwarded to the dashboard.
definePageMeta({ layout: false })

await navigateTo('/dashboard', { replace: true })
</script>

<template>
  <div />
</template>
