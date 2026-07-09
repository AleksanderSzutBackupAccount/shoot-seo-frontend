// BFF -> POST /auth/logout (Bearer)
export default defineEventHandler(async (event) => {
  await proxyToLaravel(event, '/auth/logout', { method: 'POST' })
  // Clear the local session regardless of the upstream result.
  clearAuthCookie(event)
  setResponseStatus(event, 204)
  return null
})
