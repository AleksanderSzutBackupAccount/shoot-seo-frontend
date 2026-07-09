import type { ChannelsResponse } from '~~/shared/types/api'

// BFF -> GET /channels (Bearer, X-Workspace-Id)
export default defineEventHandler(async (event) => {
  return await proxyToLaravel<ChannelsResponse>(event, '/channels', {
    workspace: true,
  })
})
