import type { CurrentPlan } from '~~/shared/types/api'

/**
 * Shared, trial-aware current-plan state (single source of truth for the
 * trial pill/banner and the billing page). SP-2 will extend this with
 * can()/limit() entitlement helpers.
 */
export function usePlan() {
  const { fetchCurrent } = useBilling()
  const current = useState<CurrentPlan | null>('current-plan', () => null)

  async function refresh(): Promise<void> {
    current.value = await fetchCurrent()
  }

  const isTrialing = computed(() => current.value?.is_trialing ?? false)
  const trialDaysLeft = computed(() => current.value?.trial_days_left ?? null)
  const isTrialEligible = computed(() => current.value?.is_trial_eligible ?? false)
  const trialEndsAt = computed(() => current.value?.trial_ends_at ?? null)

  return { current, isTrialing, trialDaysLeft, isTrialEligible, trialEndsAt, refresh }
}
