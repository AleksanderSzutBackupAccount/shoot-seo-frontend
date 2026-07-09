import type { AuthTokenResponse } from '~~/shared/types/api'

// BFF -> POST /auth/register
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const res = await proxyToLaravel<AuthTokenResponse>(event, '/auth/register', {
    method: 'POST',
    auth: false,
    body,
  })

  // Success path returns the token; store it in an httpOnly cookie and never
  // expose it to the browser.
  if (getResponseStatus(event) < 400 && res?.token) {
    setAuthCookie(event, res.token)
    return { user: res.user }
  }

  return res
})
