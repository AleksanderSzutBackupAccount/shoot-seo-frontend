import type { PostResponse } from '~~/shared/types/api'

// BFF -> POST /posts (Bearer, X-Workspace-Id)
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  return await proxyToLaravel<PostResponse>(event, '/posts', {
    method: 'POST',
    workspace: true,
    body,
  })
})
