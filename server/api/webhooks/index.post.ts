import type { CreateWebhookResponse } from '~~/shared/types/api'

// BFF -> POST /webhooks (Bearer, X-Workspace-Id)
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  return await proxyToLaravel<CreateWebhookResponse>(event, '/webhooks', {
    method: 'POST',
    workspace: true,
    body,
  })
})
