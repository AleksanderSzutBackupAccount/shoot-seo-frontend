import type { AutonomousCreatedResponse } from '~~/shared/types/api'

// BFF -> POST /autonomous/plans { site_id, frequency, tone?, topic_source? }
// (Bearer, X-Workspace-Id). A 403 (plan not entitled) is propagated verbatim.
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  return await proxyToLaravel<AutonomousCreatedResponse>(event, '/autonomous/plans', {
    method: 'POST',
    workspace: true,
    body,
  })
})
