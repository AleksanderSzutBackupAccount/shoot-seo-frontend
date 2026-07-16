import type {
  AutonomousBrief,
  AutonomousBriefResponse,
  AutonomousCreatedResponse,
  AutonomousPlan,
  AutonomousPlanStatus,
  AutonomousPlanStatusResponse,
  AutonomousPlansResponse,
  AutonomousProposal,
  AutonomousProposalsResponse,
  AutonomousSite,
  AutonomousSitesResponse,
  CreateAutonomousPlanPayload,
} from '~~/shared/types/api'

/**
 * Autonomous content (M7). Every call goes through the tenant-scoped BFF
 * (`/api/autonomous/*`), which forwards the current `X-Workspace-Id`. The wire
 * contract wraps read payloads in `{ data: ... }`; these helpers unwrap it.
 * Write endpoints (create/crawl/patch) surface the upstream 403 (plan not
 * entitled) as a thrown `$fetch` error the caller inspects via `statusCode`.
 */
export function useAutonomous() {
  async function fetchSites(): Promise<AutonomousSite[]> {
    const res = await $fetch<AutonomousSitesResponse>('/api/autonomous/sites')
    return res.data ?? []
  }

  async function createSite(url: string): Promise<string> {
    const res = await $fetch<AutonomousCreatedResponse>('/api/autonomous/sites', {
      method: 'POST',
      body: { url },
    })
    return res.id
  }

  async function crawlSite(id: string): Promise<AutonomousBrief | null> {
    const res = await $fetch<AutonomousBriefResponse>(`/api/autonomous/sites/${id}/crawl`, {
      method: 'POST',
    })
    return res.data
  }

  async function fetchBrief(id: string): Promise<AutonomousBrief | null> {
    const res = await $fetch<AutonomousBriefResponse>(`/api/autonomous/sites/${id}/brief`)
    return res.data
  }

  async function fetchPlans(): Promise<AutonomousPlan[]> {
    const res = await $fetch<AutonomousPlansResponse>('/api/autonomous/plans')
    return res.data ?? []
  }

  async function createPlan(payload: CreateAutonomousPlanPayload): Promise<string> {
    const res = await $fetch<AutonomousCreatedResponse>('/api/autonomous/plans', {
      method: 'POST',
      body: payload,
    })
    return res.id
  }

  async function updatePlan(id: string, status: AutonomousPlanStatus): Promise<AutonomousPlanStatus> {
    const res = await $fetch<AutonomousPlanStatusResponse>(`/api/autonomous/plans/${id}`, {
      method: 'PATCH',
      body: { status },
    })
    return res.status
  }

  async function fetchProposals(): Promise<AutonomousProposal[]> {
    const res = await $fetch<AutonomousProposalsResponse>('/api/autonomous/proposals')
    return res.data ?? []
  }

  return { fetchSites, createSite, crawlSite, fetchBrief, fetchPlans, createPlan, updatePlan, fetchProposals }
}
