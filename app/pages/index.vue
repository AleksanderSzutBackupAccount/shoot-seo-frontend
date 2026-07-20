<script setup lang="ts">
// Public marketing landing. The auth guard sends authenticated users to
// /dashboard, so anything rendered here is for guests.
definePageMeta({ layout: false })

const { t } = useI18n()
useSeoMeta({
  title: () => `Shoot SEO — ${t('landing.hero.headline')}`,
  description: () => t('landing.hero.subline'),
  ogTitle: () => `Shoot SEO — ${t('landing.hero.headline')}`,
  ogDescription: () => t('landing.hero.subline'),
  ogType: 'website',
  ogImage: '/logo.png',
})
</script>

<template>
  <div style="background: var(--canvas)">
    <MarketingNav />
    <main>
      <MarketingHero />
      <MarketingFeatures />
      <MarketingHowItWorks />
      <MarketingCtaBand />
    </main>
    <MarketingFooter />
  </div>
</template>
