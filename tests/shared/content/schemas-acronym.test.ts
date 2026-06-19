import { describe, it, expect } from 'vitest'

import { AcronymSchema } from '@/shared/content/schemas'

describe('AcronymSchema', () => {
  it('accepts a letter-based acronym', () => {
    const parsed = AcronymSchema.parse({
      id: 'habcde',
      acronym: 'HABCDE',
      name: 'Evaluación primaria',
      concept: 'primaria',
      isSequence: true,
      letters: [{ letter: 'H', meaning: 'Hemorragia', detail: 'Detener hemorragia.' }],
      rationale: 'Lo que mata primero, primero.',
    })
    expect(parsed.letters?.[0]?.letter).toBe('H')
  })

  it('accepts a component-based acronym (TEV)', () => {
    const parsed = AcronymSchema.parse({
      id: 'tev',
      acronym: 'TEV',
      name: 'Triángulo de Evaluación Vital',
      concept: 'escena',
      isSequence: false,
      components: [{ name: 'Respiración', detail: 'Movimientos, postura.' }],
      rationale: 'Evaluación rápida sin tocar.',
    })
    expect(parsed.components?.[0]?.name).toBe('Respiración')
  })

  it('rejects an acronym missing rationale', () => {
    expect(() =>
      AcronymSchema.parse({ id: 'x', acronym: 'X', name: 'X', concept: 'x', isSequence: false }),
    ).toThrow()
  })
})
