import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'

import { validContent } from '../../fixtures/content.fixture'

vi.mock('@/shared/content/loader', () => ({ loadContent: () => validContent }))

import { QuickRef } from '@/modules/learn/routes/QuickRef'

function renderQR() {
  return render(
    <MemoryRouter>
      <QuickRef />
    </MemoryRouter>,
  )
}

describe('QuickRef', () => {
  it('lists acronyms and the three evac levels', () => {
    renderQR()
    expect(screen.getByText(/HABCDE/)).toBeInTheDocument()
    expect(screen.getAllByText('Crítico').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Grave').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Leve').length).toBeGreaterThanOrEqual(1)
  })

  it('renders the normal vital-signs section with adult values and the instability rule', () => {
    renderQR()
    expect(screen.getByText(/Signos vitales normales/i)).toBeInTheDocument()
    expect(screen.getByText('60-100')).toBeInTheDocument()
    expect(screen.getByText('Niños 80-140')).toBeInTheDocument()
    expect(screen.getByText(/Es inestable si/i)).toBeInTheDocument()
  })

  it('renders the evacuation criteria grouped by topic, clinical topics, positions and help numbers', () => {
    renderQR()
    expect(
      screen.getByRole('heading', { name: /Criterios de evacuación por cuadro/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Heridas' })).toBeInTheDocument()
    expect(screen.getByText('Fractura abierta')).toBeInTheDocument()
    expect(screen.getByText('Inmovilizar.')).toBeInTheDocument()
    expect(screen.getByText('Buscar sangrados ocultos.')).toBeInTheDocument()
    expect(screen.getByText('Arrodillate al lado.')).toBeInTheDocument()
    expect(screen.getByText('107')).toBeInTheDocument()
  })
})
