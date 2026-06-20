import { render, screen } from '@testing-library/react'
import { HashRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'

import { validContent } from '../../fixtures/content.fixture'

vi.mock('@/shared/content/loader', () => ({ loadContent: () => validContent }))

import { ChainMap } from '@/modules/learn/routes/ChainMap'

describe('ChainMap', () => {
  it('renders all four phase titles and quick links', () => {
    render(
      <HashRouter>
        <ChainMap />
      </HashRouter>,
    )
    expect(screen.getByRole('heading', { name: /Primaria/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Evacuación/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Ver todo/i })).toHaveAttribute('href', '#/quickref')
    expect(screen.getByRole('link', { name: /Caso resuelto/i })).toHaveAttribute('href', '#/example')
  })
})
