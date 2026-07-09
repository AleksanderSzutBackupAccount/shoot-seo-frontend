import type { MediaUploadResponse } from '~~/shared/types/api'

// BFF -> POST /media (multipart: `file`) (Bearer, X-Workspace-Id)
// Reads the incoming multipart upload and forwards it verbatim to Laravel.
export default defineEventHandler(async (event) => {
  const parts = await readMultipartFormData(event)
  const filePart = parts?.find(p => p.name === 'file' && p.filename)

  if (!filePart) {
    setResponseStatus(event, 422)
    return {
      message: 'Nie przesłano pliku.',
      errors: { file: ['Plik jest wymagany.'] },
    } as unknown as MediaUploadResponse
  }

  const form = new FormData()
  // Copy into a fresh ArrayBuffer-backed view so the Blob typing is satisfied.
  const blob = new Blob([Uint8Array.from(filePart.data)], {
    type: filePart.type || 'application/octet-stream',
  })
  form.append('file', blob, filePart.filename)

  return await proxyToLaravel<MediaUploadResponse>(event, '/media', {
    method: 'POST',
    workspace: true,
    body: form,
  })
})
