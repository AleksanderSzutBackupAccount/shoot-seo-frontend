import type { Publication, PublicationsResponse } from '~~/shared/types/api'

/**
 * Per-post channel targeting (M3). Every call goes through the tenant-scoped
 * BFF (`/api/posts/{id}/channels`), which forwards the current
 * `X-Workspace-Id`.
 */
export function usePostChannels() {
  /** Sets the full list of channels a post should be published to. */
  async function set(postId: string, channelIds: string[]): Promise<Publication[]> {
    const res = await $fetch<PublicationsResponse>(`/api/posts/${postId}/channels`, {
      method: 'PUT',
      body: { channel_ids: channelIds },
    })
    return res.publications ?? []
  }

  return { set }
}
