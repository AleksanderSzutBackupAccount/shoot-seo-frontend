import type { BillingUrl } from '~~/shared/types/api'

// BFF -> POST /billing/portal (Bearer, X-Workspace-Id)
export default defineEventHandler(async (event) => {
  return await proxyToLaravel<BillingUrl>(event, '/billing/portal', {
    method: 'POST',
    workspace: true,
  })
})
