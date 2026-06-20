import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import { ChoiceCard } from '@/modules/practice/ui/cards/ChoiceCard'
import { WriteCard } from '@/modules/practice/ui/cards/WriteCard'
import type { Card } from '@/shared/content/types'

describe('practice cards', () => {
  it('WriteCard: reveals the answer, then self-grades "Me acordé" as correct', () => {
    const card = { id: 'w', topic: 'T', type: 'escribir', prompt: '¿H?', answer: ['hemorragia'], rationaleRef: 'habcde' } as Card
    const onResolve = vi.fn()
    render(<WriteCard card={card} onResolve={onResolve} />)
    // typing is just an aid; no auto-grade
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'lo que sea' } })
    fireEvent.click(screen.getByRole('button', { name: /Mostrar respuesta/i }))
    expect(screen.getByText('hemorragia')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Me acordé' }))
    expect(onResolve).toHaveBeenCalledWith(true)
  })
  it('ChoiceCard submits the selected option', () => {
    const card = { id: 'e', topic: 'T', type: 'elegir', prompt: '¿?', answer: ['No'], options: ['No', 'Sí'], rationaleRef: 'secundaria' } as Card
    const onAnswer = vi.fn()
    render(<ChoiceCard card={card} onAnswer={onAnswer} />)
    fireEvent.click(screen.getByRole('button', { name: 'Sí' }))
    fireEvent.click(screen.getByRole('button', { name: /Comprobar/i }))
    expect(onAnswer).toHaveBeenCalledWith('Sí')
  })
})
