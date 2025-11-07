import { request } from '../../shared/lib/apiClient'
import type { LabelPreviewResponse } from './types'

interface PreviewPayload {
  studentIds?: string[]
  filter?: Record<string, string>
}

export async function createLabelPreview(payload: PreviewPayload) {
  return request<LabelPreviewResponse>('/api/labels/preview', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export function downloadLabelsPdf(params: URLSearchParams) {
  const query = params.toString()
  window.open(`${import.meta.env.VITE_API_BASE_URL}/api/labels/pdf?${query}`, '_blank', 'noopener')
}
