import type { PostResponse } from '~~/shared/types/api'

// BFF -> POST /posts/{id}/unpublish (Bearer, X-Workspace-Id)
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') as string
  return await proxyToLaravel<PostResponse>(event, `/posts/${id}/unpublish`, {
    method: 'POST',
    workspace: true,
  })
})
