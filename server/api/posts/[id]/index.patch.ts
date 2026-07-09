import type { PostResponse } from '~~/shared/types/api'

// BFF -> PATCH /posts/{id} (Bearer, X-Workspace-Id)
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') as string
  const body = await readBody(event)
  return await proxyToLaravel<PostResponse>(event, `/posts/${id}`, {
    method: 'PATCH',
    workspace: true,
    body,
  })
})
