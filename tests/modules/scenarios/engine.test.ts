import { describe, it, expect } from 'vitest'

import { startRun, act, remainingBank, currentPhase } from '@/modules/scenarios/domain/engine'
import type { Case } from '@/shared/content/types'

const c: Case = {
  id: 'c', title: 'T', tag: 'Trauma', context: 'x', concepts: [], modelDebrief: [],
  phases: [
    {
      id: 'primary', state: 's', strictOrder: true,
      keyActions: [
        { id: 'H', order: 1, text: 'H', critical: true, concept: 'habcde', rationale: 'r' },
        { id: 'A', order: 2, text: 'A', critical: true, concept: 'habcde', rationale: 'r' },
      ],
      distractors: [{ id: 'frente', text: 'frente-menton', type: 'tecnica', whyNot: 'no', concept: 'habcde' }],
      reveals: [{ ifDone: 'H', text: 'sangra a chorro' }],
    },
  ],
}

describe('engine act', () => {
  it('logs a key action in order as correct and fires its reveal', () => {
    const r0 = startRun('c')
    expect(currentPhase(c, r0).id).toBe('primary')
    const { run } = act(c, r0, 'H')
    expect(run.log[0]).toMatchObject({ id: 'H', kind: 'key', critical: true, correct: true })
    expect(run.revealedTexts).toContain('sangra a chorro')
  })
  it('distractor returns immediate feedback, correct:false', () => {
    const { run, feedback } = act(c, startRun('c'), 'frente')
    expect(run.log[0]).toMatchObject({ id: 'frente', kind: 'distractor', correct: false })
    expect(feedback).toEqual({ type: 'tecnica', whyNot: 'no' })
  })
  it('strict order: A before H → outOfOrder + skippedCritical', () => {
    const { run } = act(c, startRun('c'), 'A')
    expect(run.log[0]).toMatchObject({ id: 'A', correct: false, outOfOrder: true, skippedCritical: true })
  })
  it('act twice on same id is a no-op', () => {
    const { run } = act(c, act(c, startRun('c'), 'H').run, 'H')
    expect(run.log.filter(r => r.id === 'H')).toHaveLength(1)
  })
  it('remainingBank excludes logged ids, deterministic by id', () => {
    const { run } = act(c, startRun('c'), 'H')
    expect(remainingBank(c, run).map(a => a.id)).toEqual(['A', 'frente'])
  })
})
