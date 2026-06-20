import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import { validContent } from '../../fixtures/content.fixture'

vi.mock('@/shared/content/loader', () => ({ loadContent: () => validContent }))

import { QuickRef } from '@/modules/learn/routes/QuickRef'

describe('QuickRef', () => {
  it('lists acronyms and the three evac levels', () => {
    render(<QuickRef />)
    expect(screen.getByText(/HABCDE/)).toBeInTheDocument()
    expect(screen.getByText('Crítico')).toBeInTheDocument()
    expect(screen.getByText('Grave')).toBeInTheDocument()
    expect(screen.getByText('Leve')).toBeInTheDocument()
  })
})
