import { request } from '../../shared/lib/apiClient'
import type { AuthUser, LoginRequest } from './types'

export async function login(data: LoginRequest) {
  return request<{ ok: true }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

export async function logout() {
  return request<{ ok: true }>('/api/auth/logout', {
    method: 'POST'
  })
}

export async function fetchMe() {
  return request<AuthUser>('/api/auth/me', {
    method: 'GET'
  })
}
