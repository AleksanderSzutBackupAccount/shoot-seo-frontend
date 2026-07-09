import type { AcceptInvitationResponse } from '~~/shared/types/api'

// BFF -> POST /invitations/{token}/accept (Bearer)
export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, 'token') as string
  return await proxyToLaravel<AcceptInvitationResponse>(event, `/invitations/${token}/accept`, {
    method: 'POST',
  })
})
