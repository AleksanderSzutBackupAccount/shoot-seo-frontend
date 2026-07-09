// BFF -> POST /auth/email/resend (Bearer)
export default defineEventHandler(async (event) => {
  const res = await proxyToLaravel(event, '/auth/email/resend', { method: 'POST' })
  if (getResponseStatus(event) < 400) {
    setResponseStatus(event, 202)
    return { ok: true }
  }
  return res
})
