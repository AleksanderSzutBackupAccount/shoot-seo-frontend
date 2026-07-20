<script setup lang="ts">
// Public marketing landing. The auth guard sends authenticated users to
// /dashboard, so anything rendered here is for guests.
definePageMeta({ layout: false })
</script>

<template>
  <div style="background: var(--canvas)">
    <MarketingNav />
    <main>
      <MarketingHero />
    </main>
  </div>
</template>
