import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import { Chip } from '@/shared/ui/components/Chip'

describe('Chip', () => {
  it('renders children and a severity-labelled element', () => {
    render(<Chip severity="critical">Crítico</Chip>)
    const el = screen.getByText('Crítico')
    expect(el).toBeInTheDocument()
    expect(el).toHaveAttribute('data-severity', 'critical')
  })
})
