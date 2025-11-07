import { createFetch } from '@tanstack/react-query'

const baseURL = import.meta.env.VITE_API_BASE_URL as string

if (!baseURL) {
  console.warn('VITE_API_BASE_URL is not defined')
}

export const apiClient = createFetch({
  baseUrl: baseURL ?? '',
  defaultInit: () => ({
    credentials: 'include'
  }),
  throwOnError: true
})

export async function request<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(baseURL ? `${baseURL}${input}` : String(input), {
    credentials: 'include',
    ...init,
    headers: {
      'Content-Type': init?.body instanceof FormData ? undefined : 'application/json',
      ...init?.headers
    }
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || response.statusText)
  }

  if (response.headers.get('content-type')?.includes('application/json')) {
    return (await response.json()) as T
  }

  return (await response.blob()) as unknown as T
}
