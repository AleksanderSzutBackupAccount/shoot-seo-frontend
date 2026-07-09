import type { MembersResponse } from '~~/shared/types/api'

// BFF -> GET /workspaces/{id}/members (Bearer, X-Workspace-Id)
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') as string
  return await proxyToLaravel<MembersResponse>(event, `/workspaces/${id}/members`, {
    workspaceId: id,
  })
})
