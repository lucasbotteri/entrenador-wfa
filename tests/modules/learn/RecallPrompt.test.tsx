import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'

import { RecallPrompt } from '@/modules/learn/ui/RecallPrompt'

describe('RecallPrompt (P5)', () => {
  it('hides children behind a recall button, reveals them on click', async () => {
    render(
      <RecallPrompt question="¿Por qué?">
        <p>respuesta secreta</p>
      </RecallPrompt>,
    )
    expect(screen.queryByText('respuesta secreta')).not.toBeInTheDocument()
    const btn = screen.getByRole('button', { name: /Revelar/i })
    expect(btn).toBeInTheDocument()
    await userEvent.click(btn)
    expect(screen.getByText('respuesta secreta')).toBeInTheDocument()
  })
})
