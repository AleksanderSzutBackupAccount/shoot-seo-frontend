import type { PostResponse } from '~~/shared/types/api'

// BFF -> POST /posts/{id}/schedule { scheduled_at } (Bearer, X-Workspace-Id)
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') as string
  const body = await readBody(event)
  return await proxyToLaravel<PostResponse>(event, `/posts/${id}/schedule`, {
    method: 'POST',
    workspace: true,
    body,
  })
})
