import type { MediaResponse } from '~~/shared/types/api'

// BFF -> GET /media (Bearer, X-Workspace-Id)
export default defineEventHandler(async (event) => {
  return await proxyToLaravel<MediaResponse>(event, '/media', {
    workspace: true,
  })
})
