import type { CreateApiKeyResponse } from '~~/shared/types/api'

// BFF -> POST /api-keys (Bearer, X-Workspace-Id)
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  return await proxyToLaravel<CreateApiKeyResponse>(event, '/api-keys', {
    method: 'POST',
    workspace: true,
    body,
  })
})
