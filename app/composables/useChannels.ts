import type { Channel, ChannelResponse, ChannelsResponse, ConnectResponse } from '~~/shared/types/api'

/**
 * Display metadata (label + icon) for the social channel types a post can be
 * distributed to. Single source of truth shared by DistributionPicker,
 * PostCalendar, and the posts list — keep icons in sync with the ones
 * DistributionPicker renders.
 */
export const SOCIAL_CHANNEL_META: Partial<Record<Channel['type'], { label: string, icon: string }>> = {
  facebook: { label: 'Facebook', icon: 'i-lucide-facebook' },
  linkedin: { label: 'LinkedIn', icon: 'i-lucide-linkedin' },
}

/**
 * Social publishing channels (M3). Every call goes through the tenant-scoped
 * BFF (`/api/channels*`), which forwards the current `X-Workspace-Id`.
 *
 * `connect()` starts the OAuth handshake and returns the provider's
 * `authorization_url` to redirect the user to; `complete()` finishes it once
 * the provider redirects back with a `code`/`state` pair.
 */
export function useChannels() {
  async function list(): Promise<Channel[]> {
    const res = await $fetch<ChannelsResponse>('/api/channels')
    return res.channels ?? []
  }

  /** Starts the OAuth flow for a channel type (e.g. "facebook", "linkedin"). */
  async function connect(type: Channel['type']): Promise<ConnectResponse> {
    return await $fetch<ConnectResponse>('/api/channels/connect', {
      method: 'POST',
      body: { type },
    })
  }

  /** Completes the OAuth flow after the provider redirect. */
  async function complete(payload: { type: Channel['type'], code: string, state: string }): Promise<ChannelResponse> {
    return await $fetch<ChannelResponse>('/api/channels/complete', {
      method: 'POST',
      body: payload,
    })
  }

  /** Re-authorizes a channel whose token has expired or been revoked. */
  async function refresh(id: string): Promise<ChannelResponse> {
    return await $fetch<ChannelResponse>(`/api/channels/${id}/refresh`, {
      method: 'POST',
    })
  }

  async function disconnect(id: string): Promise<void> {
    await $fetch(`/api/channels/${id}`, { method: 'DELETE' })
  }

  return { list, connect, complete, refresh, disconnect }
}
