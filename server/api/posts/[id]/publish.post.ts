import type { PostResponse } from '~~/shared/types/api'

// BFF -> POST /posts/{id}/publish (Bearer, X-Workspace-Id)
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') as string
  return await proxyToLaravel<PostResponse>(event, `/posts/${id}/publish`, {
    method: 'POST',
    workspace: true,
  })
})
