import type { AutonomousBriefResponse } from '~~/shared/types/api'

// BFF -> GET /autonomous/sites/{id}/brief (Bearer, X-Workspace-Id)
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') as string
  return await proxyToLaravel<AutonomousBriefResponse>(event, `/autonomous/sites/${id}/brief`, {
    workspace: true,
  })
})
