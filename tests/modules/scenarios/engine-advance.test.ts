import { describe, it, expect } from 'vitest'

import { startRun, act, canAdvance, advance, decide } from '@/modules/scenarios/domain/engine'
import type { Case } from '@/shared/content/types'

const c: Case = {
  id: 'c', title: 'T', tag: 'x', context: 'x', concepts: [], modelDebrief: [],
  phases: [
    { id: 'primary', state: 's', strictOrder: true,
      keyActions: [
        { id: 'H', order: 1, text: 'H', critical: true, concept: 'habcde', rationale: 'r' },
        { id: 'D', order: 5, text: 'D', critical: false, concept: 'habcde', rationale: 'r' },
      ],
      distractors: [], reveals: [] },
    { id: 'evacuation', state: 'e',
      keyActions: [], distractors: [], reveals: [],
      decision: { correct: 'CRÍTICO', options: [{ level: 'CRÍTICO', correct: true, feedback: 'ok' }, { level: 'LEVE', correct: false, feedback: 'no' }] } },
  ],
}

describe('engine advance/decide', () => {
  it('canAdvance only when all critical key actions are logged (non-critical optional)', () => {
    let r = startRun('c')
    expect(canAdvance(c, r)).toBe(false)
    r = act(c, r, 'H').run
    expect(canAdvance(c, r)).toBe(true) // D is non-critical, not required
  })
  it('advance moves to the next phase', () => {
    const r = advance(startRun('c'))
    expect(r.phaseIndex).toBe(1)
  })
  it('advance clears revealedTexts (reveals are phase-scoped)', () => {
    const withReveal = { ...startRun('c'), revealedTexts: ['old reveal'] }
    expect(advance(withReveal).revealedTexts).toEqual([])
  })
  it('decide records the chosen evacuation level', () => {
    expect(decide(advance(startRun('c')), 'CRÍTICO').decision).toBe('CRÍTICO')
  })
})
