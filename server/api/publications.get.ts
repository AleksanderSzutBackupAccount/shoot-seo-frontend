import type { PublicationsResponse } from '~~/shared/types/api'

// BFF -> GET /publications (Bearer, X-Workspace-Id)
export default defineEventHandler(async (event) => {
  return await proxyToLaravel<PublicationsResponse>(event, '/publications', {
    workspace: true,
  })
})
