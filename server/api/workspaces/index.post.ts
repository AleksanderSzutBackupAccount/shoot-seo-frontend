import type { CreateWorkspaceResponse } from '~~/shared/types/api'

// BFF -> POST /workspaces { name }
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  return await proxyToLaravel<CreateWorkspaceResponse>(event, '/workspaces', {
    method: 'POST',
    body,
  })
})
