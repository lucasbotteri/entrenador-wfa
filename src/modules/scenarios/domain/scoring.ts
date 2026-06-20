import type { RunState } from './engine'

import type { Case } from '@/shared/content/types'

export interface RunScore {
  criticalDone: number
  criticalTotal: number
  dangerous: number
  prioritiesOk: boolean
}

export function scoreRun(c: Case, run: RunState): RunScore {
  const criticalTotal = c.phases.reduce((n, p) => n + p.keyActions.filter(k => k.critical).length, 0)
  const criticalDone = run.log.filter(r => r.kind === 'key' && r.critical && r.correct).length
  const dangerous = run.log.filter(r => r.kind === 'distractor').length
  const prioritiesOk = !run.log.some(r => r.outOfOrder || r.skippedCritical)
  return { criticalDone, criticalTotal, dangerous, prioritiesOk }
}
