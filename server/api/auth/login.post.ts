import type { LoginResponse } from '~~/shared/types/api'

// BFF -> POST /auth/login
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const res = await proxyToLaravel<LoginResponse>(event, '/auth/login', {
    method: 'POST',
    auth: false,
    body,
  })

  if (getResponseStatus(event) < 400 && res?.token) {
    setAuthCookie(event, res.token)
    return { user: res.user, workspaces: res.workspaces }
  }

  return res
})
