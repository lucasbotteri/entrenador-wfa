import { describe, it, expect } from 'vitest'

import { buildDebrief } from '@/modules/scenarios/domain/debrief'
import { startRun, act, advance, decide } from '@/modules/scenarios/domain/engine'
import type { Case } from '@/shared/content/types'

const c: Case = {
  id: 'c', title: 'T', tag: 'x', context: 'x', concepts: [], modelDebrief: [],
  phases: [
    { id: 'primary', state: 's', strictOrder: true,
      keyActions: [
        { id: 'H', order: 1, text: 'Control hemorragia', critical: true, concept: 'habcde', rationale: 'r' },
        { id: 'A', order: 2, text: 'Vía aérea', critical: true, concept: 'habcde', rationale: 'r' },
      ],
      distractors: [{ id: 'agua', text: 'Darle agua', type: 'misconcepcion', whyNot: 'No con shock', concept: 'habcde' }], reveals: [] },
    { id: 'evacuation', state: 'e', keyActions: [], distractors: [], reveals: [],
      decision: { correct: 'CRÍTICO', options: [{ level: 'CRÍTICO', correct: true, feedback: 'urgente' }, { level: 'LEVE', correct: false, feedback: 'no' }] } },
  ],
}

describe('buildDebrief', () => {
  it('derives did/missed/dangerous/priorities/evacuation from the run', () => {
    let r = startRun('c')
    r = act(c, r, 'H').run
    r = act(c, r, 'agua').run
    r = advance(r)         // to evacuation (A omitted)
    r = decide(r, 'CRÍTICO')
    const d = buildDebrief(c, r)
    expect(d.did.map(i => i.text)).toContain('Control hemorragia')
    expect(d.missed.map(i => i.text)).toContain('Vía aérea')
    expect(d.dangerous[0]).toMatchObject({ text: 'Darle agua' })
    expect(d.dangerous[0]!.link).toBe('/chain/primary-habcde-h')
    expect(d.dangerous[0]!.detail).toBe('No con shock')
    expect(d.priorities.ok).toBe(true)
    expect(d.evacuation).toMatchObject({ chosen: 'CRÍTICO', correct: 'CRÍTICO', ok: true, feedback: 'urgente' })
  })
})
