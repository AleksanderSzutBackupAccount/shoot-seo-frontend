import type { ApiKey, ApiKeysResponse, CreateApiKeyResponse } from '~~/shared/types/api'

/**
 * Headless API keys (M2 — Delivery). Every call goes through the tenant-scoped
 * BFF (`/api/api-keys*`), which forwards the current `X-Workspace-Id`.
 *
 * The plaintext key is returned by `create()` ONLY once and is never refetched —
 * callers must surface it from the create response and discard it after.
 */
export function useApiKeys() {
  async function list(): Promise<ApiKey[]> {
    const res = await $fetch<ApiKeysResponse>('/api/api-keys')
    return res.keys ?? []
  }

  /** Creates a key. The response carries the one-time `plaintext` value. */
  async function create(name: string, scopes?: string[]): Promise<CreateApiKeyResponse> {
    return await $fetch<CreateApiKeyResponse>('/api/api-keys', {
      method: 'POST',
      body: { name, ...(scopes && scopes.length ? { scopes } : {}) },
    })
  }

  async function revoke(id: string): Promise<void> {
    await $fetch(`/api/api-keys/${id}`, { method: 'DELETE' })
  }

  return { list, create, revoke }
}
