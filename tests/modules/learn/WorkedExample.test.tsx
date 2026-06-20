import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'

import { validContent } from '../../fixtures/content.fixture'

vi.mock('@/shared/content/loader', () => ({ loadContent: () => validContent }))

import { WorkedExample } from '@/modules/learn/routes/WorkedExample'

function renderWE() {
  return render(
    <MemoryRouter>
      <WorkedExample />
    </MemoryRouter>,
  )
}

describe('WorkedExample (P6)', () => {
  it('renders the title and the scene + clinical step actions', () => {
    renderWE()
    expect(screen.getByText(/Caída en descenso/i)).toBeInTheDocument()
    expect(screen.getByText(/1 · Seguridad/i)).toBeInTheDocument()
    expect(screen.getByText(/Controlás la hemorragia/i)).toBeInTheDocument()
  })

  it('shows a self-explanation pause before the first clinical beat; reveal on tap', async () => {
    renderWE()
    expect(screen.getByText('¿Qué observarías antes de tocar?')).toBeInTheDocument()
    expect(screen.queryByText(/No responde, respira, piel pálida/i)).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Revelar/i }))
    expect(screen.getByText(/No responde, respira, piel pálida/i)).toBeInTheDocument()
  })
})
