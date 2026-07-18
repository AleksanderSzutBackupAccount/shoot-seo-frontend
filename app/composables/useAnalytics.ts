import type {
  AnalyticsDateRange,
  AnalyticsOverview,
  AnalyticsOverviewResponse,
  AnalyticsPostRow,
  AnalyticsPostsResponse,
} from '~~/shared/types/api'

/** Formats a `Date` as a local `YYYY-MM-DD` string (no UTC drift). */
export function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Inclusive window ending today, spanning the last `days` days. */
export function lastNDaysRange(days: number): AnalyticsDateRange {
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - (days - 1))
  return { from: isoDate(from), to: isoDate(to) }
}

/**
 * Human-friendly engagement time from milliseconds:
 *  - under a minute -> `"42s"`
 *  - a minute or more -> `"1:23"` (m:ss)
 */
export function formatEngagement(ms: number | null | undefined): string {
  const totalSeconds = Math.max(0, Math.round((ms ?? 0) / 1000))
  if (totalSeconds < 60) return `${totalSeconds}s`
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

/** Thousands-grouped count, formatted for the given locale (e.g. `1 234`). */
export function formatCount(value: number | null | undefined, locale: string): string {
  return (value ?? 0).toLocaleString(locale)
}

/**
 * Analytics (M6). Every call goes through the tenant-scoped BFF
 * (`/api/analytics/*`), which forwards the current `X-Workspace-Id`. The wire
 * contract wraps payloads in `{ data: ... }`; these helpers unwrap it.
 */
export function useAnalytics() {
  async function fetchOverview(range: AnalyticsDateRange): Promise<AnalyticsOverview> {
    const res = await $fetch<AnalyticsOverviewResponse>('/api/analytics/overview', { query: range })
    return res.data
  }

  async function fetchTopPosts(range: AnalyticsDateRange, limit = 10): Promise<AnalyticsPostRow[]> {
    const res = await $fetch<AnalyticsPostsResponse>('/api/analytics/posts', {
      query: { ...range, limit },
    })
    return res.data ?? []
  }

  async function fetchPost(slug: string, range: AnalyticsDateRange): Promise<AnalyticsOverview> {
    const res = await $fetch<AnalyticsOverviewResponse>(`/api/analytics/posts/${slug}`, { query: range })
    return res.data
  }

  return { fetchOverview, fetchTopPosts, fetchPost }
}
