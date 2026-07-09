import type {
  CreateWebhookResponse,
  Webhook,
  WebhookDeliveriesResponse,
  WebhookDelivery,
  WebhooksResponse,
} from '~~/shared/types/api'

/**
 * Outbound webhooks (M2 — Delivery). Every call goes through the tenant-scoped
 * BFF (`/api/webhooks*`), which forwards the current `X-Workspace-Id`.
 *
 * The signing `secret` is returned by `create()` ONLY once and is never
 * refetched — callers must surface it from the create response and discard it.
 */
export function useWebhooks() {
  async function list(): Promise<Webhook[]> {
    const res = await $fetch<WebhooksResponse>('/api/webhooks')
    return res.webhooks ?? []
  }

  /** Creates a webhook. The response carries the one-time `secret` value. */
  async function create(url: string, events: string[]): Promise<CreateWebhookResponse> {
    return await $fetch<CreateWebhookResponse>('/api/webhooks', {
      method: 'POST',
      body: { url, events },
    })
  }

  async function remove(id: string): Promise<void> {
    await $fetch(`/api/webhooks/${id}`, { method: 'DELETE' })
  }

  async function deliveries(id: string): Promise<WebhookDelivery[]> {
    const res = await $fetch<WebhookDeliveriesResponse>(`/api/webhooks/${id}/deliveries`)
    return res.deliveries ?? []
  }

  return { list, create, remove, deliveries }
}
