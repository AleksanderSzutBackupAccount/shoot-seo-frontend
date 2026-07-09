// BFF -> DELETE /posts/{id} (Bearer, X-Workspace-Id)
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') as string
  const res = await proxyToLaravel(event, `/posts/${id}`, {
    method: 'DELETE',
    workspace: true,
  })
  if (getResponseStatus(event) < 400) {
    setResponseStatus(event, 204)
    return null
  }
  return res
})
