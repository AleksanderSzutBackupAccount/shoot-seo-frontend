import type { AutonomousBriefResponse } from '~~/shared/types/api'

// BFF -> POST /autonomous/sites/{id}/crawl (Bearer, X-Workspace-Id)
// Returns the distilled brief, or a 403 when the plan is not entitled.
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') as string
  return await proxyToLaravel<AutonomousBriefResponse>(event, `/autonomous/sites/${id}/crawl`, {
    method: 'POST',
    workspace: true,
  })
})
