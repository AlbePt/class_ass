import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, useState } from 'react'
import { toast } from 'sonner'

export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            refetchOnWindowFocus: false
          },
          mutations: {
            retry: false
          }
        },
        queryCache: new QueryCache({
          onError: (error) => {
            if (error instanceof Error && error.message.includes('401')) {
              window.location.href = '/login'
            } else {
              toast.error('Что-то пошло не так')
            }
          }
        })
      })
  )

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
