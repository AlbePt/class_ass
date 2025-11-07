import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './shared/styles/globals.css'
import './shared/i18n'
import { router } from './app/router'
import { ThemeProvider } from './app/providers/ThemeProvider'
import { I18nProvider } from './app/providers/I18nProvider'
import { QueryProvider } from './app/providers/QueryProvider'
import { Toaster } from 'sonner'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nProvider>
      <ThemeProvider>
        <QueryProvider>
          <RouterProvider router={router} />
          <Toaster position="top-right" richColors />
        </QueryProvider>
      </ThemeProvider>
    </I18nProvider>
  </React.StrictMode>
)
