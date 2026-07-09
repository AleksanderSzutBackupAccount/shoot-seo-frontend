import type {
  CalendarEntry,
  CalendarResponse,
  CreatePostPayload,
  Post,
  PostResponse,
  PostsResponse,
  PostSummary,
  UpdatePostPayload,
} from '~~/shared/types/api'

/**
 * Content posts + planer actions. Every call goes through the tenant-scoped BFF
 * (`/api/posts*`, `/api/calendar`), which forwards the current `X-Workspace-Id`.
 */
export function usePosts() {
  async function list(): Promise<PostSummary[]> {
    const res = await $fetch<PostsResponse>('/api/posts')
    return res.posts ?? []
  }

  async function get(id: string): Promise<Post> {
    const res = await $fetch<PostResponse>(`/api/posts/${id}`)
    return res.post
  }

  async function create(payload: CreatePostPayload): Promise<Post> {
    const res = await $fetch<PostResponse>('/api/posts', {
      method: 'POST',
      body: payload,
    })
    return res.post
  }

  async function update(id: string, payload: UpdatePostPayload): Promise<Post> {
    const res = await $fetch<PostResponse>(`/api/posts/${id}`, {
      method: 'PATCH',
      body: payload,
    })
    return res.post
  }

  async function remove(id: string): Promise<void> {
    await $fetch(`/api/posts/${id}`, { method: 'DELETE' })
  }

  /** Sets `status=scheduled` + `scheduled_at`. `scheduledAt` must be ISO 8601. */
  async function schedule(id: string, scheduledAt: string): Promise<Post> {
    const res = await $fetch<PostResponse>(`/api/posts/${id}/schedule`, {
      method: 'POST',
      body: { scheduled_at: scheduledAt },
    })
    return res.post
  }

  /** Sets `status=published`, `published_at=now`. */
  async function publish(id: string): Promise<Post> {
    const res = await $fetch<PostResponse>(`/api/posts/${id}/publish`, {
      method: 'POST',
    })
    return res.post
  }

  /** Reverts to `status=draft` and clears `published_at`. */
  async function unpublish(id: string): Promise<Post> {
    const res = await $fetch<PostResponse>(`/api/posts/${id}/unpublish`, {
      method: 'POST',
    })
    return res.post
  }

  /** Calendar entries for the planer. `month` is `YYYY-MM` (defaults server-side). */
  async function fetchCalendar(month?: string): Promise<CalendarEntry[]> {
    const res = await $fetch<CalendarResponse>('/api/calendar', {
      query: month ? { month } : undefined,
    })
    return res.posts ?? []
  }

  return { list, get, create, update, remove, schedule, publish, unpublish, fetchCalendar }
}
