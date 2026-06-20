import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'

import { validContent } from '../../fixtures/content.fixture'

vi.mock('@/shared/content/loader', () => ({ loadContent: () => validContent }))

import { WorkedExample } from '@/modules/learn/routes/WorkedExample'

describe('WorkedExample', () => {
  it('renders the title and each step state/action', () => {
    render(
      <MemoryRouter>
        <WorkedExample />
      </MemoryRouter>,
    )
    expect(screen.getByText(/Caída en descenso/i)).toBeInTheDocument()
    expect(screen.getByText(/Sangrado pulsátil/i)).toBeInTheDocument()
    expect(screen.getByText(/Controlás la hemorragia/i)).toBeInTheDocument()
  })
})
