import type { Publication, PublicationsResponse } from '~~/shared/types/api'

/**
 * Per-channel publication (delivery) records for the workspace (M3). Every
 * call goes through the tenant-scoped BFF (`/api/publications`), which
 * forwards the current `X-Workspace-Id`. Used to seed the distribution
 * picker's current channel selection and to render per-channel status
 * badges on the posts list / calendar.
 */
export function usePublications() {
  async function list(): Promise<Publication[]> {
    const res = await $fetch<PublicationsResponse>('/api/publications')
    return res.publications ?? []
  }

  return { list }
}

/** Badge label + color per publication delivery status. */
export const publicationStatusMeta: Record<Publication['status'], { label: string, color: 'success' | 'error' | 'neutral' }> = {
  pending: { label: 'Oczekuje', color: 'neutral' },
  success: { label: 'Opublikowano', color: 'success' },
  failed: { label: 'Błąd', color: 'error' },
  revoked: { label: 'Wycofano', color: 'neutral' },
}
