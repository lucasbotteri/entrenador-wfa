import 'fake-indexeddb/auto'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'

import { Shell } from '@/shared/app/Shell'
import { __resetStorage } from '@/shared/domain/storage'

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

  it('shows a due-count badge on Practicar when cards are due', async () => {
    // No SRS state in fresh storage → all fixture/real cards are due → badge > 0
    __resetStorage()
    render(
      <MemoryRouter initialEntries={['/practice']}>
        <Shell><p>x</p></Shell>
      </MemoryRouter>,
    )
    const practicar = await screen.findByRole('link', { name: /Practicar/i })
    // badge text is a number; assert the link contains a digit
    await waitFor(() => expect(practicar.textContent).toMatch(/\d/))
  })

  it('Escenarios tab is an active link on /scenarios', () => {
    render(
      <MemoryRouter initialEntries={['/scenarios']}>
        <Shell><p>x</p></Shell>
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: /Escenarios/i })).toHaveAttribute('href', '/scenarios')
  })
})
