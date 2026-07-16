import type { AutonomousPlanStatusResponse } from '~~/shared/types/api'

// BFF -> PATCH /autonomous/plans/{id} { status } (Bearer, X-Workspace-Id)
// A 403 (plan not entitled) is propagated verbatim.
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') as string
  const body = await readBody(event)
  return await proxyToLaravel<AutonomousPlanStatusResponse>(event, `/autonomous/plans/${id}`, {
    method: 'PATCH',
    workspace: true,
    body,
  })
})
