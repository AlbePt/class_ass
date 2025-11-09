const envBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim()
const baseURL = (envBaseUrl && envBaseUrl.length > 0 ? envBaseUrl : 'http://localhost:8000').replace(/\/$/, '')

if (!envBaseUrl) {
  console.warn(`VITE_API_BASE_URL is not defined. Falling back to ${baseURL}`)
}

export async function request<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const resolvedInput =
    typeof input === 'string' && !input.startsWith('http')
      ? `${baseURL}${input.startsWith('/') ? input : `/${input}`}`
      : input

  const response = await fetch(resolvedInput, {
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
