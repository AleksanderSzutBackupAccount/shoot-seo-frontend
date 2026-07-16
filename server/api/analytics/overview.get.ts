import type { AnalyticsOverviewResponse } from '~~/shared/types/api'

// BFF -> GET /analytics/overview?from=YYYY-MM-DD&to=YYYY-MM-DD (Bearer, X-Workspace-Id)
export default defineEventHandler(async (event) => {
  const { from, to } = getQuery(event) as { from?: string, to?: string }
  return await proxyToLaravel<AnalyticsOverviewResponse>(event, '/analytics/overview', {
    workspace: true,
    // `undefined` values are dropped by ofetch — omitting both lets the backend
    // fall back to its default (last 28 days).
    query: { from, to },
  })
})
