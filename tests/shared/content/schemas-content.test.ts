import { describe, it, expect } from 'vitest'

import {
  ContentSchema,
  ChainPhaseSchema,
  PracticalRuleSchema,
  VitalSignsSchema,
} from '@/shared/content/schemas'

const minimal = {
  meta: { source: 's', version: '0', language: 'es' },
  acronyms: [
    {
      id: 'habcde',
      acronym: 'HABCDE',
      name: 'Primaria',
      concept: 'primaria',
      isSequence: true,
      letters: [{ letter: 'H', meaning: 'Hemorragia', detail: 'Detener.' }],
      rationale: 'Primero lo que mata.',
    },
  ],
  chain: [{ phase: 'primary', name: 'Primaria', rationale: 'Orden.', content: {} }],
  vitalSigns: { components: ['FC'] },
  practicalRules: [{ id: 'hemorragia', rule: 'Presión directa.', concept: 'habcde' }],
  evacLevels: [{ level: 'CRÍTICO', color: 'rojo', criterion: 'Evacuar ya.' }],
  clinicalTopics: [{ id: 'shock', name: 'Shock', rationale: 'Hipoperfusión.' }],
  cards: [],
  workedExample: {
    title: 't',
    steps: [{ phase: 'primary', state: 's', action: 'a', rationaleRef: 'habcde' }],
  },
}

describe('ContentSchema', () => {
  it('accepts a minimal valid content object', () => {
    const parsed = ContentSchema.parse(minimal)
    expect(parsed.chain.length).toBeGreaterThan(0)
    expect(parsed.evacLevels[0]?.level).toBe('CRÍTICO')
    expect(parsed.workedExample.steps.length).toBeGreaterThan(0)
  })

  it('rejects an unknown phase id', () => {
    const bad = { ...minimal, chain: [{ ...minimal.chain[0], phase: 'nope' }] }
    expect(() => ContentSchema.parse(bad)).toThrow()
  })
})

describe('fixes schemas', () => {
  it('accepts a scene phase with sequence + next', () => {
    const p = ChainPhaseSchema.parse({
      phase: 'scene', name: 'Escena', rationale: 'r', strictOrder: true,
      sequence: [{ order: 1, part: 'seguridad', priority: true, includes: ['bioseguridad'] }, { order: 2, part: 'mecanismo_dano' }],
      next: 'buscar_ayuda', content: {},
    })
    expect(p.sequence?.[0]?.part).toBe('seguridad')
    expect(p.next).toBe('buscar_ayuda')
  })
  it('accepts a practical rule with letter', () => {
    expect(PracticalRuleSchema.parse({ id: 'x', rule: 'r', concept: 'habcde', letter: 'A' }).letter).toBe('A')
  })
  it('carries vitalSigns.reevaluacion', () => {
    const vs = VitalSignsSchema.parse({ reevaluacion: { estable: '15-20 min', inestable: '5 min' } })
    expect((vs.reevaluacion as Record<string, string>).estable).toBe('15-20 min')
  })
})
