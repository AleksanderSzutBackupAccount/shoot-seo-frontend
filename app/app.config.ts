export default defineAppConfig({
  ui: {
    // Monochrome editorial brand: no accent colour. Warm "stone" neutral carries
    // canvas / hairlines / ink. The near-black CTA is Nuxt UI's `neutral` solid.
    colors: {
      primary: 'stone',
      neutral: 'stone',
    },

    // Pill CTAs are the brand signature. tailwind-merge lets these append and
    // win over the component defaults (rounded-md -> rounded-full).
    button: {
      slots: {
        base: 'rounded-full font-medium tracking-tight transition-all duration-200',
      },
      defaultVariants: {
        color: 'neutral',
      },
    },

    input: { slots: { base: 'rounded-lg' } },
    textarea: { slots: { base: 'rounded-lg' } },
    select: { slots: { base: 'rounded-lg' } },
    selectMenu: { slots: { base: 'rounded-lg' } },

    card: {
      slots: {
        root: 'rounded-2xl',
      },
    },

    modal: {
      slots: {
        content: 'rounded-2xl',
      },
    },
  },
})
