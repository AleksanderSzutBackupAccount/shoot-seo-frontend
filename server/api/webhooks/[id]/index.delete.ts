// BFF -> DELETE /webhooks/{id} (Bearer, X-Workspace-Id)
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') as string
  const res = await proxyToLaravel(event, `/webhooks/${id}`, {
    method: 'DELETE',
    workspace: true,
  })
  if (getResponseStatus(event) < 400) {
    setResponseStatus(event, 204)
    return null
  }
  return res
})
