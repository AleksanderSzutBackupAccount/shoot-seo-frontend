import type { MeResponse } from '~~/shared/types/api'

// BFF -> GET /auth/me (Bearer)
export default defineEventHandler(async (event) => {
  return await proxyToLaravel<MeResponse>(event, '/auth/me')
})
