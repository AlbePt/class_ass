import { ReactNode } from 'react'
import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { I18nProvider } from '../app/providers/I18nProvider'
import { ThemeProvider } from '../app/providers/ThemeProvider'

export function renderWithProviders(ui: ReactNode, { route = '/' } = {}) {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  })

  return render(
    <MemoryRouter initialEntries={[route]}>
      <QueryClientProvider client={client}>
        <I18nProvider>
          <ThemeProvider>{ui}</ThemeProvider>
        </I18nProvider>
      </QueryClientProvider>
    </MemoryRouter>
  )
}
