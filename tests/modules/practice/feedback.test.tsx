import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'

import { FeedbackPanel } from '@/modules/practice/ui/FeedbackPanel'
import { linkForRef } from '@/shared/domain/conceptLinks'

describe('feedback', () => {
  it('linkForRef maps a known concept to a chain route, unknown to /', () => {
    expect(linkForRef('habcde')).toBe('/chain/primary-habcde-h')
    expect(linkForRef('zzz')).toBe('/')
  })
  it('shows the rationale, correct banner, and box movement', () => {
    render(
      <MemoryRouter>
        <FeedbackPanel
          correct
          correctText="hemorragia"
          rationale="Lo que mata primero, primero."
          rationaleRef="habcde"
          fromBox={2}
          toBox={3}
          onContinue={() => {}}
        />
      </MemoryRouter>,
    )
    expect(screen.getByText(/Por qué/i)).toBeInTheDocument()
    expect(screen.getByText(/mata primero/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Ver .* en Aprender/i })).toHaveAttribute('href', '/chain/primary-habcde-h')
  })
})
