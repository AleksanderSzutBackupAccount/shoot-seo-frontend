import type { AutonomousSitesResponse } from '~~/shared/types/api'

// BFF -> GET /autonomous/sites (Bearer, X-Workspace-Id)
export default defineEventHandler(async (event) => {
  return await proxyToLaravel<AutonomousSitesResponse>(event, '/autonomous/sites', {
    workspace: true,
  })
})
