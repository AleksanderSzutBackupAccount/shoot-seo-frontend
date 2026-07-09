import type { WebhooksResponse } from '~~/shared/types/api'

// BFF -> GET /webhooks (Bearer, X-Workspace-Id)
export default defineEventHandler(async (event) => {
  return await proxyToLaravel<WebhooksResponse>(event, '/webhooks', {
    workspace: true,
  })
})
