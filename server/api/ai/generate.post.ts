import type { AiResult } from '~~/shared/types/api'

// BFF -> POST /ai/generate (Bearer, X-Workspace-Id)
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  return await proxyToLaravel<AiResult>(event, '/ai/generate', {
    method: 'POST',
    body,
    workspace: true,
  })
})
