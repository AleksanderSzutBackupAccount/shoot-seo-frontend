import type { CurrentPlan } from '~~/shared/types/api'

// BFF -> GET /billing/plan (Bearer, X-Workspace-Id)
export default defineEventHandler(async (event) => {
  return await proxyToLaravel<CurrentPlan>(event, '/billing/plan', {
    workspace: true,
  })
})
