import type { User } from '~~/shared/types/api'

// BFF -> POST /auth/email/verify (Bearer) { id, hash }
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  return await proxyToLaravel<{ user: User }>(event, '/auth/email/verify', {
    method: 'POST',
    body,
  })
})
