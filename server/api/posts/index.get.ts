import type { PostsResponse } from '~~/shared/types/api'

// BFF -> GET /posts (Bearer, X-Workspace-Id)
export default defineEventHandler(async (event) => {
  return await proxyToLaravel<PostsResponse>(event, '/posts', {
    workspace: true,
  })
})
