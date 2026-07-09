// BFF -> DELETE /workspaces/{id}/members/{userId}
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') as string
  const userId = getRouterParam(event, 'userId') as string
  const res = await proxyToLaravel(event, `/workspaces/${id}/members/${userId}`, {
    method: 'DELETE',
    workspaceId: id,
  })
  if (getResponseStatus(event) < 400) {
    setResponseStatus(event, 204)
    return null
  }
  return res
})
