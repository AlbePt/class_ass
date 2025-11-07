import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { LabelsPreview } from '../features/print-labels/LabelsPreview'

const pages = [
  { url: 'data:image/png;base64,aaa' },
  { url: 'data:image/png;base64,bbb' }
]

describe('LabelsPreview', () => {
  it('renders pages with preview images', () => {
    const { getAllByRole } = render(<LabelsPreview pages={pages} />)
    const images = getAllByRole('img')
    expect(images).toHaveLength(2)
  })
})
