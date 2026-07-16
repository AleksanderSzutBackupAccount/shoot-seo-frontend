import type { BillingUrl } from '~~/shared/types/api'

// BFF -> POST /billing/checkout { plan } (Bearer, X-Workspace-Id)
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  return await proxyToLaravel<BillingUrl>(event, '/billing/checkout', {
    method: 'POST',
    body,
    workspace: true,
  })
})
