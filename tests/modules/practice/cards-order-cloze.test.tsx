import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import { ClozeCard } from '@/modules/practice/ui/cards/ClozeCard'
import { OrderCard } from '@/modules/practice/ui/cards/OrderCard'
import type { Card } from '@/shared/content/types'

describe('order + cloze cards', () => {
  it('OrderCard submits the current order; ↑ moves an item up', () => {
    const card = { id: 'o', topic: 'T', type: 'ordenar', prompt: 'Ordená', answer: ['H', 'A', 'B'], rationaleRef: 'habcde' } as Card
    const onAnswer = vi.fn()
    render(<OrderCard card={card} onAnswer={onAnswer} />)
    // move the 2nd item up (buttons labelled "Subir <item>")
    fireEvent.click(screen.getByRole('button', { name: /Subir A/i }))
    fireEvent.click(screen.getByRole('button', { name: /Comprobar/i }))
    expect(onAnswer).toHaveBeenCalledWith(['A', 'B', 'H'])
  })
  it('ClozeCard: renders one input per blank, reveals the answer, self-grades "No me acordé" as wrong', () => {
    const card = { id: 'c', topic: 'T', type: 'cloze', prompt: 'A {{Verbal}} y {{Dolor}}', answer: ['verbal', 'dolor'], rationaleRef: 'avdn' } as Card
    const onResolve = vi.fn()
    render(<ClozeCard card={card} onResolve={onResolve} />)
    expect(screen.getAllByRole('textbox')).toHaveLength(2)
    fireEvent.click(screen.getByRole('button', { name: /Mostrar respuesta/i }))
    expect(screen.getByText('verbal, dolor')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'No me acordé' }))
    expect(onResolve).toHaveBeenCalledWith(false)
  })
})
