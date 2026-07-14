import type { PublicHostResponse } from '~~/shared/types/api'

/**
 * Public host setting (M3) — the base URL used to build absolute links for
 * published content (e.g. in social posts). Every call goes through the
 * tenant-scoped BFF (`/api/settings/public-host`), which forwards the
 * current `X-Workspace-Id`.
 */
export function usePublicHost() {
  async function get(): Promise<string | null> {
    const res = await $fetch<PublicHostResponse>('/api/settings/public-host')
    return res.public_base_url
  }

  async function set(publicBaseUrl: string): Promise<PublicHostResponse> {
    return await $fetch<PublicHostResponse>('/api/settings/public-host', {
      method: 'PUT',
      body: { public_base_url: publicBaseUrl },
    })
  }

  return { get, set }
}
