import { request } from '../../shared/lib/apiClient'
import type { ReportSummary } from './types'

export interface ReportFilters {
  class?: string
  quarter?: string
}

export async function fetchCurrentReport(filters: ReportFilters) {
  const params = new URLSearchParams()
  if (filters.class) params.set('class', filters.class)
  if (filters.quarter) params.set('quarter', filters.quarter)
  const query = params.size ? `?${params.toString()}` : ''
  return request<ReportSummary>(`/api/reports/current${query}`, {
    method: 'GET'
  })
}

export function downloadCurrentReport(format: 'pdf' | 'xlsx') {
  const path = format === 'pdf' ? '/api/reports/current.pdf' : '/api/reports/current.xlsx'
  window.open(`${import.meta.env.VITE_API_BASE_URL}${path}`, '_blank', 'noopener')
}
