import type { AutonomousCreatedResponse } from '~~/shared/types/api'

// BFF -> POST /autonomous/sites { url } (Bearer, X-Workspace-Id)
// The proxy mirrors the upstream status, so a 403 (plan not entitled) is
// propagated to the client verbatim.
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  return await proxyToLaravel<AutonomousCreatedResponse>(event, '/autonomous/sites', {
    method: 'POST',
    workspace: true,
    body,
  })
})
