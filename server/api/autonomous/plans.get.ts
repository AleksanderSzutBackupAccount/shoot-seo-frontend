import type { AutonomousPlansResponse } from '~~/shared/types/api'

// BFF -> GET /autonomous/plans (Bearer, X-Workspace-Id)
export default defineEventHandler(async (event) => {
  return await proxyToLaravel<AutonomousPlansResponse>(event, '/autonomous/plans', {
    workspace: true,
  })
})
