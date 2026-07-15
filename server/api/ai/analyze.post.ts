import type { AiAnalysis } from '~~/shared/types/api'

// BFF -> POST /ai/analyze (Bearer, X-Workspace-Id)
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  return await proxyToLaravel<AiAnalysis>(event, '/ai/analyze', {
    method: 'POST',
    body,
    workspace: true,
  })
})
