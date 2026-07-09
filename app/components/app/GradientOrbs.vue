<script setup lang="ts">
// Atmospheric pastel orbs — the brand's only "colour" moment. Decoration only.
// Drop inside any `position: relative` container; sits behind content (z-0).
withDefaults(defineProps<{ variant?: 'default' | 'hero' | 'corner' }>(), {
  variant: 'default',
})
</script>

<template>
  <div class="orb-field" aria-hidden="true">
    <template v-if="variant === 'hero'">
      <span class="orb orb--mint" style="width: 34rem; height: 34rem; top: -12rem; left: -8rem; animation-delay: 0s" />
      <span class="orb orb--lavender" style="width: 30rem; height: 30rem; top: -6rem; right: -10rem; animation-delay: -6s" />
      <span class="orb orb--peach" style="width: 26rem; height: 26rem; bottom: -14rem; left: 18%; animation-delay: -12s" />
      <span class="orb orb--sky" style="width: 20rem; height: 20rem; bottom: -8rem; right: 8%; animation-delay: -18s" />
    </template>

    <template v-else-if="variant === 'corner'">
      <span class="orb orb--lavender" style="width: 20rem; height: 20rem; top: -9rem; right: -7rem; animation-delay: -3s" />
      <span class="orb orb--mint" style="width: 15rem; height: 15rem; bottom: -8rem; left: -5rem; animation-delay: -14s" />
    </template>

    <template v-else>
      <span class="orb orb--mint" style="width: 22rem; height: 22rem; top: -10rem; left: -6rem; animation-delay: 0s" />
      <span class="orb orb--peach" style="width: 18rem; height: 18rem; bottom: -9rem; right: -4rem; animation-delay: -10s" />
    </template>
  </div>
</template>
