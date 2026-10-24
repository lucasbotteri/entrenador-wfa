import 'fake-indexeddb/auto'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
  it('shows the node title and its item detail; rationale is hidden until revealed', async () => {
    renderAt('/chain/primary-habcde-h')
    expect(screen.getByRole('heading', { name: 'Hemorragia' })).toBeInTheDocument()
    expect(screen.getByText(/Detener hemorragia/i)).toBeInTheDocument()
    expect(screen.queryByText(/mata en minutos/i)).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Revelar: ¿Por qué\?/i }))
    expect(screen.getByText(/mata en minutos/i)).toBeInTheDocument()
  })

  it('renders the letter steps as a list and the next link to the following node', () => {
    renderAt('/chain/primary-habcde-h')
    expect(screen.getByText('Presión directa con apósitos.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Siguiente →/i })).toHaveAttribute(
      'href',
      '/chain/primary-habcde-a',
    )
  })

  it('shows the position in the link and a sibling strip; the next step is hidden behind a recall prompt', async () => {
    renderAt('/chain/primary-habcde-h')
    expect(screen.getByText(/Eslabón 2 · paso 2 de 4/i)).toBeInTheDocument()
    const strip = screen.getByRole('navigation', { name: /Pasos de este eslabón/i })
    expect(strip.querySelector('[aria-current="page"]')).toHaveTextContent('H')
    expect(screen.queryByText('Siguiente paso')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Revelar: ¿Qué paso sigue\?/i }))
    expect(screen.getByText('Siguiente paso')).toBeInTheDocument()
    expect(screen.getByText(/A · Apertura de la vía aérea/)).toBeInTheDocument()
  })

  it('renders a StepBadge + priority for an ordered scene node', () => {
    renderAt('/chain/scene-safety')
    expect(screen.getByLabelText('Paso 1')).toBeInTheDocument()
    expect(screen.getByText('prioridad')).toBeInTheDocument()
  })
})
