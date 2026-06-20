import { describe, it, expect } from 'vitest'

import { grade, answerText } from '@/modules/practice/domain/grading'
import type { Card } from '@/shared/content/types'

const c = (over: Partial<Card>): Card =>
  ({ id: 'x', topic: 'T', type: 'escribir', prompt: 'p', answer: ['a'], rationaleRef: 'habcde', ...over }) as Card

describe('grade', () => {
  it('escribir: normalizes accents/case and matches list', () => {
    expect(grade(c({ answer: ['vía aérea', 'apertura'] }), 'VIA AEREA').correct).toBe(true)
    expect(grade(c({ answer: ['hemorragia'] }), 'pulmon').correct).toBe(false)
  })
  it('escribir: multi-word answer accepts all-tokens-present any order', () => {
    expect(grade(c({ answer: ['respiracion circulacion aspecto general'] }), 'aspecto general, respiracion y circulacion').correct).toBe(true)
  })
  it('ordenar: exact sequence', () => {
    expect(grade(c({ type: 'ordenar', answer: ['H', 'A', 'B'] }), ['H', 'A', 'B']).correct).toBe(true)
    expect(grade(c({ type: 'ordenar', answer: ['H', 'A', 'B'] }), ['A', 'H', 'B']).correct).toBe(false)
  })
  it('cloze: all blanks must match (normalized)', () => {
    const card = c({ type: 'cloze', prompt: '{{Verbal}} y {{Dolor}}', answer: ['verbal', 'dolor'] })
    expect(grade(card, ['Verbal', 'DOLOR']).correct).toBe(true)
    expect(grade(card, ['verbal', 'x']).correct).toBe(false)
  })
  it('elegir: matches answer[0]', () => {
    const card = c({ type: 'elegir', answer: ['No, nada por boca'], options: ['No, nada por boca', 'Sí'] })
    expect(grade(card, 'No, nada por boca').correct).toBe(true)
    expect(grade(card, 'Sí').correct).toBe(false)
  })
})

describe('answerText', () => {
  it('joins ordenar with arrows, cloze with commas, and uses answer[0] for escribir/elegir', () => {
    expect(answerText(c({ type: 'ordenar', answer: ['H', 'A', 'B'] }))).toBe('H → A → B')
    expect(answerText(c({ type: 'cloze', answer: ['verbal', 'dolor'] }))).toBe('verbal, dolor')
    expect(answerText(c({ type: 'escribir', answer: ['hemorragia'] }))).toBe('hemorragia')
    expect(answerText(c({ type: 'elegir', answer: ['No'], options: ['No', 'Sí'] }))).toBe('No')
  })
})
