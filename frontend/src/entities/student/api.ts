import { request } from '../../shared/lib/apiClient'
import type { Student, StudentDetail } from './types'

export interface StudentFilters {
  class?: string
  risk?: string
  q?: string
}

export interface StudentListResponse {
  items: Student[]
  total: number
}

export async function fetchStudents(filters: StudentFilters) {
  const searchParams = new URLSearchParams()
  if (filters.class) searchParams.set('class', filters.class)
  if (filters.risk) searchParams.set('risk', filters.risk)
  if (filters.q) searchParams.set('q', filters.q)
  const query = searchParams.size > 0 ? `?${searchParams.toString()}` : ''
  return request<StudentListResponse>(`/api/students${query}`, {
    method: 'GET'
  })
}

export async function fetchStudent(id: string) {
  return request<StudentDetail>(`/api/students/${id}`, {
    method: 'GET'
  })
}
