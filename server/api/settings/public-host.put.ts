import type { PublicHostResponse } from '~~/shared/types/api'

// BFF -> PUT /settings/public-host { public_base_url } (Bearer, X-Workspace-Id)
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  return await proxyToLaravel<PublicHostResponse>(event, '/settings/public-host', {
    method: 'PUT',
    body,
    workspace: true,
  })
})
