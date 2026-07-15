import type { AiAnalysis, AiResult, AiUsage } from '~~/shared/types/api'

/**
 * AI content engine (M4). Every call goes through the tenant-scoped BFF
 * (`/api/ai/*`), which forwards the current `X-Workspace-Id`. `usage` is a
 * shared `useState` so the usage meter stays in sync across every call site.
 */
export function useAi() {
  const usage = useState<AiUsage | null>('ai-usage', () => null)

  async function fetchUsage(): Promise<void> {
    usage.value = await $fetch<AiUsage>('/api/ai/usage')
  }

  async function generate(body: { variant: 'draft' | 'titles' | 'meta', topic: string, tone?: string, keywords?: string[] }): Promise<AiResult> {
    const res = await $fetch<AiResult>('/api/ai/generate', { method: 'POST', body })
    await fetchUsage()
    return res
  }

  async function improve(body: { fragment: string, instruction: string }): Promise<AiResult> {
    const res = await $fetch<AiResult>('/api/ai/improve', { method: 'POST', body })
    await fetchUsage()
    return res
  }

  async function analyze(body: { content: string }): Promise<AiAnalysis> {
    const res = await $fetch<AiAnalysis>('/api/ai/analyze', { method: 'POST', body })
    await fetchUsage()
    return res
  }

  return { usage, fetchUsage, generate, improve, analyze }
}
