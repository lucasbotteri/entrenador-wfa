import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import { Icon } from '@/shared/ui/components/Icon'
import { LetterBadge } from '@/shared/ui/components/LetterBadge'

describe('icon + badge', () => {
  it('LetterBadge shows the letter with an aria-label', () => {
    render(<LetterBadge letter="H" />)
    const el = screen.getByLabelText('Letra H')
    expect(el).toHaveTextContent('H')
  })

  it('Icon renders an svg for a known concept', () => {
    const { container } = render(<Icon concept="hemorrhage" />)
    expect(container.querySelector('svg')).toBeTruthy()
  })
})
