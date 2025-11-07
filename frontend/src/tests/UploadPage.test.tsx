import { vi, describe, it, expect } from 'vitest'
import { fireEvent, waitFor } from '@testing-library/react'
import { UploadPage } from '../pages/upload/UploadPage'
import { renderWithProviders } from './test-utils'
import { uploadFile } from '../entities/session/api'

vi.mock('../entities/session/api', () => ({
  uploadFile: vi.fn(() =>
    Promise.resolve({
      session_id: 'abc',
      stats: {},
      validation: { errors: [], warnings: [] }
    })
  ),
  clearSession: vi.fn(() => Promise.resolve({ ok: true })),
  getSessionStatus: vi.fn(() => Promise.resolve({ session_id: 'abc', expires_in_sec: 1800 }))
}))

vi.mock('../entities/session/store', async (original) => {
  const mod = await original()
  return {
    ...mod,
    useSessionStore: () => ({
      setSession: vi.fn(),
      clear: vi.fn()
    })
  }
})

describe('UploadPage', () => {
  it('uploads file via dropzone', async () => {
    const { getByRole, getByText } = renderWithProviders(<UploadPage />)
    const input = getByRole('button', { name: /перетащите/i })

    const file = new File(['content'], 'students.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

    fireEvent.drop(input, {
      dataTransfer: {
        files: [file],
        items: [],
        types: ['Files']
      }
    })

    fireEvent.click(getByText(/предпросмотр/i))

    await waitFor(() => {
      expect(uploadFile).toHaveBeenCalled()
    })
  })
})
