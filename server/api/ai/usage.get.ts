import type { AiUsage } from '~~/shared/types/api'

// BFF -> GET /ai/usage (Bearer, X-Workspace-Id)
export default defineEventHandler(async (event) => {
  return await proxyToLaravel<AiUsage>(event, '/ai/usage', {
    workspace: true,
  })
})
