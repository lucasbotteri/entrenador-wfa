import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'

import { Shell } from '@/shared/app/Shell'

describe('Shell', () => {
  it('renders header label and a skip link', () => {
    render(
      <MemoryRouter>
        <Shell>
          <p>contenido</p>
        </Shell>
      </MemoryRouter>,
    )
    expect(screen.getByText(/Aprender/i)).toBeInTheDocument()
    expect(screen.getByText('contenido')).toBeInTheDocument()
    expect(screen.getByText(/Saltar al contenido/i)).toBeInTheDocument()
  })
})
