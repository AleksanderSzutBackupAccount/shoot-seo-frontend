import type { ChannelResponse } from '~~/shared/types/api'

// BFF -> POST /channels/{id}/refresh (Bearer, X-Workspace-Id)
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') as string
  return await proxyToLaravel<ChannelResponse>(event, `/channels/${id}/refresh`, {
    method: 'POST',
    workspace: true,
  })
})
