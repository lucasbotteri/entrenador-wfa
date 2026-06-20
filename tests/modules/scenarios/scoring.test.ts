import { describe, it, expect } from 'vitest'

import { startRun, act } from '@/modules/scenarios/domain/engine'
import { scoreRun } from '@/modules/scenarios/domain/scoring'
import type { Case } from '@/shared/content/types'

const c: Case = {
  id: 'c', title: 'T', tag: 'x', context: 'x', concepts: [], modelDebrief: [],
  phases: [
    { id: 'primary', state: 's', strictOrder: true,
      keyActions: [
        { id: 'H', order: 1, text: 'H', critical: true, concept: 'habcde', rationale: 'r' },
        { id: 'A', order: 2, text: 'A', critical: true, concept: 'habcde', rationale: 'r' },
      ],
      distractors: [{ id: 'agua', text: 'agua', type: 'misconcepcion', whyNot: 'no', concept: 'habcde' }], reveals: [] },
  ],
}

describe('scoreRun', () => {
  it('counts criticals done in order, dangerous distractors, priorities', () => {
    let r = startRun('c')
    r = act(c, r, 'H').run
    r = act(c, r, 'agua').run
    r = act(c, r, 'A').run
    const s = scoreRun(c, r)
    expect(s).toEqual({ criticalDone: 2, criticalTotal: 2, dangerous: 1, prioritiesOk: true })
  })
  it('out-of-order critical drops prioritiesOk and criticalDone', () => {
    let r = startRun('c')
    r = act(c, r, 'A').run // before H → outOfOrder/skippedCritical
    r = act(c, r, 'H').run
    const s = scoreRun(c, r)
    expect(s.prioritiesOk).toBe(false)
    expect(s.criticalDone).toBe(1) // only H counted correct
  })
})
