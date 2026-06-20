import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import { StepBadge } from '@/shared/ui/components/StepBadge'

describe('StepBadge', () => {
  it('renders the number with an aria-label', () => {
    render(<StepBadge n={2} />)
    const el = screen.getByLabelText('Paso 2')
    expect(el).toHaveTextContent('2')
  })
})
