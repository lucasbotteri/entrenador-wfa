import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import { SelfGradeCard } from '@/modules/practice/ui/SelfGradeCard'
import type { Card } from '@/shared/content/types'

const card = { id: 'w', topic: 'T', type: 'escribir', prompt: '¿H?', answer: ['hemorragia'], rationaleRef: 'habcde' } as Card

function renderCard(onResolve = vi.fn()) {
  render(
    <SelfGradeCard card={card} onResolve={onResolve}>
      <input aria-label="Respuesta" />
    </SelfGradeCard>,
  )
  return onResolve
}

describe('SelfGradeCard', () => {
  it('hides the answer until "Mostrar respuesta", then reveals it with two self-grade buttons', () => {
    renderCard()
    expect(screen.queryByText('hemorragia')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Me acordé' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Mostrar respuesta/i }))
    expect(screen.getByText('hemorragia')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Me acordé' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'No me acordé' })).toBeInTheDocument()
  })

  it('"Me acordé" resolves true', () => {
    const onResolve = renderCard()
    fireEvent.click(screen.getByRole('button', { name: /Mostrar respuesta/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Me acordé' }))
    expect(onResolve).toHaveBeenCalledWith(true)
  })

  it('"No me acordé" resolves false', () => {
    const onResolve = renderCard()
    fireEvent.click(screen.getByRole('button', { name: /Mostrar respuesta/i }))
    fireEvent.click(screen.getByRole('button', { name: 'No me acordé' }))
    expect(onResolve).toHaveBeenCalledWith(false)
  })
})
