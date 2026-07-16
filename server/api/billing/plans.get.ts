import type { PlansResponse } from '~~/shared/types/api'

// BFF -> GET /billing/plans (Bearer, X-Workspace-Id)
export default defineEventHandler(async (event) => {
  return await proxyToLaravel<PlansResponse>(event, '/billing/plans', {
    workspace: true,
  })
})
