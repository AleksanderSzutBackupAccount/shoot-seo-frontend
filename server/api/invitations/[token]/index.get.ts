import type { InvitationPreviewResponse } from '~~/shared/types/api'

// BFF -> GET /invitations/{token} (public)
export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, 'token') as string
  return await proxyToLaravel<InvitationPreviewResponse>(event, `/invitations/${token}`, {
    auth: false,
  })
})
