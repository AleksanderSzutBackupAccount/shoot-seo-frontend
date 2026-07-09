// BFF -> POST /auth/password/reset { token, email, password, password_confirmation }
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const res = await proxyToLaravel(event, '/auth/password/reset', {
    method: 'POST',
    auth: false,
    body,
  })
  if (getResponseStatus(event) < 400) {
    return { ok: true }
  }
  return res
})
