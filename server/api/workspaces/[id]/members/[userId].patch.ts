import type { MemberResponse } from '~~/shared/types/api'

// BFF -> PATCH /workspaces/{id}/members/{userId} { role }
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') as string
  const userId = getRouterParam(event, 'userId') as string
  const body = await readBody(event)
  return await proxyToLaravel<MemberResponse>(event, `/workspaces/${id}/members/${userId}`, {
    method: 'PATCH',
    workspaceId: id,
    body,
  })
})
