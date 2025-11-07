import { describe, expect, it, vi, beforeEach } from 'vitest'
import { fireEvent, waitFor } from '@testing-library/react'
import { StudentsPage } from '../pages/students/StudentsPage'
import { renderWithProviders } from './test-utils'
import { fetchStudents } from '../entities/student/api'

vi.mock('../entities/student/api', () => ({
  fetchStudents: vi.fn(() =>
    Promise.resolve({
      items: [
        { id: '1', fio: 'Иван Иванов', class: '7A', avg: 4.2, risk: 'A' },
        { id: '2', fio: 'Петр Петров', class: '7B', avg: 3.8, risk: 'B' }
      ],
      total: 2
    })
  )
}))

describe('StudentsPage', () => {
  beforeEach(() => {
    vi.mocked(fetchStudents).mockClear()
  })

  it('renders students and responds to filters', async () => {
    const { getByText, getByRole } = renderWithProviders(<StudentsPage />, { route: '/students' })

    await waitFor(() => {
      expect(getByText('Иван Иванов')).toBeInTheDocument()
    })

    fireEvent.click(getByRole('button', { name: '7A' }))

    await waitFor(() => {
      expect(fetchStudents).toHaveBeenLastCalledWith({ class: '7A', risk: undefined, q: undefined })
    })
  })
})
