import { request } from '../../shared/lib/apiClient'

export interface UploadResponse {
  session_id: string
  stats: Record<string, number>
  validation: {
    errors: string[]
    warnings: string[]
  }
}

export interface SessionStatus {
  session_id: string
  expires_in_sec: number
}

export async function uploadFile(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return request<UploadResponse>('/api/upload', {
    method: 'POST',
    body: formData
  })
}

export async function getSessionStatus() {
  return request<SessionStatus>('/api/session/status', {
    method: 'GET'
  })
}

export async function clearSession() {
  return request<{ ok: true }>('/api/session/clear', {
    method: 'POST'
  })
}
