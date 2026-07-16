import type { AnalyticsOverviewResponse } from '~~/shared/types/api'

// BFF -> GET /analytics/posts/{slug}?from&to (Bearer, X-Workspace-Id)
export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug') as string
  const { from, to } = getQuery(event) as { from?: string, to?: string }
  return await proxyToLaravel<AnalyticsOverviewResponse>(event, `/analytics/posts/${slug}`, {
    workspace: true,
    query: { from, to },
  })
})
