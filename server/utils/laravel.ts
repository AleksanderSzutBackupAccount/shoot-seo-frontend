import type { H3Event } from 'h3'
import { FetchError } from 'ofetch'

export const AUTH_COOKIE = 'auth_token'
export const WORKSPACE_COOKIE = 'workspace_id'

interface ProxyOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  /** JSON body forwarded to Laravel. */
  body?: unknown
  /** Attach `Authorization: Bearer <token>` from the httpOnly cookie. Default: true. */
  auth?: boolean
  /** Attach `X-Workspace-Id` from the workspace cookie. Default: false. */
  workspace?: boolean
  /** Explicit `X-Workspace-Id` (e.g. from the route param); takes precedence over the cookie. */
  workspaceId?: string
  query?: Record<string, string | number | boolean | undefined>
}

function baseUrl(): string {
  return useRuntimeConfig().apiBase
}

function buildHeaders(event: H3Event, opts: ProxyOptions): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  }

  if (opts.auth !== false) {
    const token = getCookie(event, AUTH_COOKIE)
    if (token) headers.Authorization = `Bearer ${token}`
  }

  if (opts.workspaceId) {
    headers['X-Workspace-Id'] = opts.workspaceId
  }
  else if (opts.workspace) {
    const workspaceId = getCookie(event, WORKSPACE_COOKIE)
    if (workspaceId) headers['X-Workspace-Id'] = workspaceId
  }

  return headers
}

/**
 * Proxies a request to the Laravel REST API.
 *
 * On upstream error, the response status is mirrored and the upstream JSON body
 * (e.g. Laravel's `{ message, errors }` 422 payload) is returned verbatim so the
 * UI can surface field-level validation errors. On success the parsed body is
 * returned typed as `T`.
 */
export async function proxyToLaravel<T>(
  event: H3Event,
  path: string,
  opts: ProxyOptions = {},
): Promise<T> {
  try {
    const response = await $fetch.raw(`${baseUrl()}${path}`, {
      method: opts.method ?? 'GET',
      body: opts.body as Record<string, unknown> | undefined,
      query: opts.query,
      headers: buildHeaders(event, opts),
    })
    // Mirror the upstream success status (201 Created, 204 No Content, ...).
    setResponseStatus(event, response.status, response.statusText)
    return response._data as T
  }
  catch (error) {
    if (error instanceof FetchError && error.response) {
      setResponseStatus(event, error.response.status, error.response.statusText)
      // Pass the upstream body through untouched (validation errors, 404, etc.).
      return (error.data ?? { message: error.response.statusText }) as T
    }
    // Network / unexpected failure: the API is likely unreachable.
    setResponseStatus(event, 502)
    return { message: 'Nie udało się połączyć z API.' } as T
  }
}

/** Stores the Sanctum bearer token in a hardened httpOnly cookie. */
export function setAuthCookie(event: H3Event, token: string): void {
  setCookie(event, AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: !import.meta.dev,
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })
}

/** Clears the auth token cookie (logout). */
export function clearAuthCookie(event: H3Event): void {
  deleteCookie(event, AUTH_COOKIE, {
    httpOnly: true,
    sameSite: 'lax',
    secure: !import.meta.dev,
    path: '/',
  })
}
