import type { Media, MediaResponse, MediaUploadResponse } from '~~/shared/types/api'

/**
 * Media library actions. Uploads are multipart and forwarded verbatim by the
 * BFF (`/api/media`), which attaches the current `X-Workspace-Id`.
 */
export function useMedia() {
  async function list(): Promise<Media[]> {
    const res = await $fetch<MediaResponse>('/api/media')
    return res.media ?? []
  }

  async function upload(file: File): Promise<Media> {
    const form = new FormData()
    form.append('file', file)
    const res = await $fetch<MediaUploadResponse>('/api/media', {
      method: 'POST',
      body: form,
    })
    return res.media
  }

  return { list, upload }
}
