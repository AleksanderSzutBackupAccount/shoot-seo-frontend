import type { CreateInvitationResponse } from '~~/shared/types/api'

// BFF -> POST /workspaces/{id}/invitations { email, role }
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') as string
  const body = await readBody(event)
  return await proxyToLaravel<CreateInvitationResponse>(event, `/workspaces/${id}/invitations`, {
    method: 'POST',
    workspaceId: id,
    body,
  })
})
