import type { WebhookDeliveriesResponse } from '~~/shared/types/api'

// BFF -> GET /webhooks/{id}/deliveries (Bearer, X-Workspace-Id)
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') as string
  return await proxyToLaravel<WebhookDeliveriesResponse>(event, `/webhooks/${id}/deliveries`, {
    workspace: true,
  })
})
