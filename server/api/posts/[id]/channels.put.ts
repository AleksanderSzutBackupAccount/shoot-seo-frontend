import type { PublicationsResponse } from '~~/shared/types/api'

// BFF -> PUT /posts/{id}/channels { channel_ids } (Bearer, X-Workspace-Id)
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') as string
  const body = await readBody(event)
  return await proxyToLaravel<PublicationsResponse>(event, `/posts/${id}/channels`, {
    method: 'PUT',
    body,
    workspace: true,
  })
})
