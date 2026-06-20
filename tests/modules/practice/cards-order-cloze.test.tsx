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
  it('ClozeCard submits one value per blank', () => {
    const card = { id: 'c', topic: 'T', type: 'cloze', prompt: 'A {{Verbal}} y {{Dolor}}', answer: ['verbal', 'dolor'], rationaleRef: 'avdn' } as Card
    const onAnswer = vi.fn()
    render(<ClozeCard card={card} onAnswer={onAnswer} />)
    const inputs = screen.getAllByRole('textbox')
    expect(inputs).toHaveLength(2)
    fireEvent.change(inputs[0]!, { target: { value: 'verbal' } })
    fireEvent.change(inputs[1]!, { target: { value: 'dolor' } })
    fireEvent.click(screen.getByRole('button', { name: /Comprobar/i }))
    expect(onAnswer).toHaveBeenCalledWith(['verbal', 'dolor'])
  })
})
