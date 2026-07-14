import type { ConnectResponse } from '~~/shared/types/api'

// BFF -> POST /channels/connect { type } (Bearer, X-Workspace-Id)
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  return await proxyToLaravel<ConnectResponse>(event, '/channels/connect', {
    method: 'POST',
    body,
    workspace: true,
  })
})
