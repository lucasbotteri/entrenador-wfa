import 'fake-indexeddb/auto'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'

import { validContent } from '../../fixtures/content.fixture'

vi.mock('@/shared/content/loader', () => ({ loadContent: () => validContent }))

import { NodeDetail } from '@/modules/learn/routes/NodeDetail'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/chain/:nodeId" element={<NodeDetail />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('NodeDetail', () => {
  it('shows the node title, its item detail, and the rationale (por qué)', () => {
    renderAt('/chain/primary-habcde-h')
    expect(screen.getByRole('heading', { name: 'Hemorragia' })).toBeInTheDocument()
    expect(screen.getByText(/Detener hemorragia/i)).toBeInTheDocument()
    expect(screen.getByText(/Por qué/i)).toBeInTheDocument()
    expect(screen.getByText(/mata primero/i)).toBeInTheDocument()
  })

  it('renders next link to the following node', () => {
    renderAt('/chain/primary-habcde-h')
    expect(screen.getByRole('link', { name: /Siguiente/i })).toHaveAttribute(
      'href',
      '/chain/primary-habcde-a',
    )
  })
})
