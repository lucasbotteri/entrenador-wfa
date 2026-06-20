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

  it('renders the tab bar with Aprender + Practicar', () => {
    render(
      <MemoryRouter initialEntries={['/practice']}>
        <Shell>
          <p>x</p>
        </Shell>
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: /Aprender/i })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: /Practicar/i })).toHaveAttribute('href', '/practice')
  })
})
