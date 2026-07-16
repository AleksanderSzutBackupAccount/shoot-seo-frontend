import type { BillingUrl, CurrentPlan, Plan, PlansResponse } from '~~/shared/types/api'

/**
 * Plans & subscriptions (M5 — Billing). Every call goes through the
 * tenant-scoped BFF (`/api/billing/*`), which forwards the current
 * `X-Workspace-Id`. `checkout`/`portal` return a Stripe-hosted URL the caller
 * redirects the browser to.
 */
export function useBilling() {
  async function fetchPlans(): Promise<Plan[]> {
    const res = await $fetch<PlansResponse>('/api/billing/plans')
    return res.plans ?? []
  }

  async function fetchCurrent(): Promise<CurrentPlan> {
    return await $fetch<CurrentPlan>('/api/billing/plan')
  }

  /** Starts a Stripe Checkout session for `plan`. Returns the redirect URL. */
  async function checkout(plan: string): Promise<string> {
    const res = await $fetch<BillingUrl>('/api/billing/checkout', { method: 'POST', body: { plan } })
    return res.url
  }

  /** Starts a Stripe Billing Portal session. Returns the redirect URL. */
  async function portal(): Promise<string> {
    const res = await $fetch<BillingUrl>('/api/billing/portal', { method: 'POST' })
    return res.url
  }

  return { fetchPlans, fetchCurrent, checkout, portal }
}
