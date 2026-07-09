import type { CalendarResponse } from '~~/shared/types/api'

// BFF -> GET /calendar?month=YYYY-MM (Bearer, X-Workspace-Id)
export default defineEventHandler(async (event) => {
  const { month } = getQuery(event) as { month?: string }
  return await proxyToLaravel<CalendarResponse>(event, '/calendar', {
    workspace: true,
    query: month ? { month } : undefined,
  })
})
