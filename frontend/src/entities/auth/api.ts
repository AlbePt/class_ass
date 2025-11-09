import { request } from '../../shared/lib/apiClient'
import type { AuthUser, LoginRequest, RegisterRequest } from './types'

export async function login(data: LoginRequest) {
  const body = new URLSearchParams()
  body.set('username', data.email)
  body.set('password', data.password)

  return request<{ access_token: string }>('/auth/login', {
    method: 'POST',
    body,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}

export async function register(data: RegisterRequest) {
  return request<{ email: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

export async function logout() {
  return request<{ ok: true }>('/auth/logout', {
    method: 'POST'
  })
}

export async function fetchMe() {
  return request<AuthUser>('/auth/me', {
    method: 'GET'
  })
}
