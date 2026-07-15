import type { ChannelResponse } from '~~/shared/types/api'

// BFF -> POST /channels/complete { type, code, state } (Bearer, X-Workspace-Id)
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  return await proxyToLaravel<ChannelResponse>(event, '/channels/complete', {
    method: 'POST',
    body,
    workspace: true,
  })
})
