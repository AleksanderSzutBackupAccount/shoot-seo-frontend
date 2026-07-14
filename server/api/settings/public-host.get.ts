import type { PublicHostResponse } from '~~/shared/types/api'

// BFF -> GET /settings/public-host (Bearer, X-Workspace-Id)
export default defineEventHandler(async (event) => {
  return await proxyToLaravel<PublicHostResponse>(event, '/settings/public-host', {
    workspace: true,
  })
})
