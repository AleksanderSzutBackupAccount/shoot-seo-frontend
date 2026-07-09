import type { WorkspacesResponse } from '~~/shared/types/api'

// BFF -> GET /workspaces (Bearer)
export default defineEventHandler(async (event) => {
  return await proxyToLaravel<WorkspacesResponse>(event, '/workspaces')
})
