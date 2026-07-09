import type { ApiKeysResponse } from '~~/shared/types/api'

// BFF -> GET /api-keys (Bearer, X-Workspace-Id)
export default defineEventHandler(async (event) => {
  return await proxyToLaravel<ApiKeysResponse>(event, '/api-keys', {
    workspace: true,
  })
})
