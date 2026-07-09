import type { PostResponse } from '~~/shared/types/api'

// BFF -> GET /posts/{id} (Bearer, X-Workspace-Id)
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') as string
  return await proxyToLaravel<PostResponse>(event, `/posts/${id}`, {
    workspace: true,
  })
})
