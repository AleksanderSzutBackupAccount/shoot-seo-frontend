import type { AutonomousProposalsResponse } from '~~/shared/types/api'

// BFF -> GET /autonomous/proposals (Bearer, X-Workspace-Id)
export default defineEventHandler(async (event) => {
  return await proxyToLaravel<AutonomousProposalsResponse>(event, '/autonomous/proposals', {
    workspace: true,
  })
})
