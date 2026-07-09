// BFF -> POST /auth/password/forgot { email }
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const res = await proxyToLaravel(event, '/auth/password/forgot', {
    method: 'POST',
    auth: false,
    body,
  })
  if (getResponseStatus(event) < 400) {
    setResponseStatus(event, 202)
    return { ok: true }
  }
  return res
})
