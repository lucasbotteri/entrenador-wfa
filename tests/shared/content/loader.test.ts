import { describe, it, expect, vi } from 'vitest'

// Inline minimal Content inside vi.hoisted so it is available to the hoisted vi.mock factories.
const mock = vi.hoisted(() => ({
  content: {
    meta: { source: 's', version: '0', language: 'es' },
    acronyms: [
      {
        id: 'habcde',
        acronym: 'HABCDE',
        name: 'P',
        concept: 'primaria',
        isSequence: true,
        letters: [{ letter: 'H', meaning: 'Hemorragia', detail: 'Detener.' }],
        rationale: 'Primero.',
      },
    ],
    chain: [{ phase: 'primary', name: 'P', rationale: 'r', content: {} }],
    vitalSigns: { components: ['FC'] },
    practicalRules: [{ id: 'hemorragia', rule: 'r', concept: 'habcde' }],
    evacLevels: [{ level: 'CRÍTICO', color: 'rojo', criterion: 'c' }],
    clinicalTopics: [{ id: 'shock', name: 'Shock', rationale: 'r' }],
    cards: [],
    workedExample: {
      title: 't',
      steps: [{ phase: 'primary', state: 's', action: 'a', rationaleRef: 'habcde' }],
    },
  },
}))

vi.mock('@/shared/content/generated/content.json', () => ({ default: mock.content }))
vi.mock('@/shared/content/generated/cases.json', () => ({ default: [] }))

import { loadContent } from '@/shared/content/loader'

describe('loadContent', () => {
  it('returns validated content and memoizes', () => {
    const a = loadContent()
    const b = loadContent()
    expect(a.acronyms[0]?.id).toBe('habcde')
    expect(a).toBe(b) // same reference → memoized
  })
})
