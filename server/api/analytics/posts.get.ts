import type { AnalyticsPostsResponse } from '~~/shared/types/api'

// BFF -> GET /analytics/posts?from&to&limit (Bearer, X-Workspace-Id)
export default defineEventHandler(async (event) => {
  const { from, to, limit } = getQuery(event) as { from?: string, to?: string, limit?: string }
  return await proxyToLaravel<AnalyticsPostsResponse>(event, '/analytics/posts', {
    workspace: true,
    query: { from, to, limit },
  })
})
