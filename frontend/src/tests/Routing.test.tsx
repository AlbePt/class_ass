import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { render, waitFor } from '@testing-library/react'
import { RequireAuth } from '../app/routes/RequireAuth'

vi.mock('../entities/auth/api', () => ({
  fetchMe: vi.fn(() => Promise.reject(new Error('401')))
}))

vi.mock('../entities/auth/store', () => ({
  useAuthStore: () => ({
    user: null,
    setUser: vi.fn()
  })
}))

vi.mock('../entities/session/api', () => ({
  getSessionStatus: vi.fn(() => Promise.resolve({ session_id: 'abc', expires_in_sec: 1000 }))
}))

vi.mock('../entities/session/store', () => ({
  useSessionStore: () => ({
    setSession: vi.fn()
  })
}))

describe('Routing', () => {
  it('redirects unauthenticated users to login', async () => {
    const { getByText } = render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/login" element={<div>Login page</div>} />
          <Route path="/" element={<RequireAuth />}>
            <Route index element={<div>Dashboard</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(getByText('Login page')).toBeInTheDocument()
    })
  })
})
