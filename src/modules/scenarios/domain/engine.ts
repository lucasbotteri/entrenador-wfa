import type { Case, ScenarioPhase } from '@/shared/content/types'

type KeyAction = ScenarioPhase['keyActions'][number]
type Distractor = ScenarioPhase['distractors'][number]

export interface ActionRecord {
  id: string
  kind: 'key' | 'distractor'
  critical: boolean
  correct: boolean
  outOfOrder?: boolean
  skippedCritical?: boolean
}
export interface RunState {
  caseId: string
  phaseIndex: number
  log: ActionRecord[]
  revealedTexts: string[]
  decision?: string
}

export function startRun(caseId: string): RunState {
  return { caseId, phaseIndex: 0, log: [], revealedTexts: [] }
}

export function currentPhase(c: Case, run: RunState): ScenarioPhase {
  return c.phases[run.phaseIndex]!
}

export function act(
  c: Case,
  run: RunState,
  actionId: string,
): { run: RunState; feedback?: { type: string; whyNot: string } } {
  const phase = currentPhase(c, run)
  if (run.log.some(r => r.id === actionId)) return { run }
  const key = phase.keyActions.find(k => k.id === actionId)
  const dist = phase.distractors.find(d => d.id === actionId)
  if (!key && !dist) return { run }

  let record: ActionRecord
  let feedback: { type: string; whyNot: string } | undefined
  if (key) {
    let outOfOrder = false
    let skippedCritical = false
    if (phase.strictOrder && key.critical && key.order != null) {
      const lowerCriticals = phase.keyActions.filter(
        k => k.critical && k.order != null && k.order < key.order!,
      )
      const undone = lowerCriticals.filter(k => !run.log.some(r => r.id === k.id))
      if (undone.length) {
        outOfOrder = true
        const minOrder = Math.min(
          ...phase.keyActions.filter(k => k.critical && k.order != null).map(k => k.order!),
        )
        if (undone.some(k => k.order === minOrder)) skippedCritical = true
      }
    }
    record = {
      id: actionId,
      kind: 'key',
      critical: key.critical,
      correct: !outOfOrder,
      ...(outOfOrder ? { outOfOrder: true } : {}),
      ...(skippedCritical ? { skippedCritical: true } : {}),
    }
  } else {
    record = { id: actionId, kind: 'distractor', critical: false, correct: false }
    feedback = { type: dist!.type, whyNot: dist!.whyNot }
  }

  const revealedTexts = [...run.revealedTexts]
  for (const rv of phase.reveals) {
    if (rv.ifDone === actionId && !revealedTexts.includes(rv.text)) revealedTexts.push(rv.text)
  }
  return {
    run: { ...run, log: [...run.log, record], revealedTexts },
    ...(feedback ? { feedback } : {}),
  }
}

export function remainingBank(c: Case, run: RunState): Array<KeyAction | Distractor> {
  const phase = currentPhase(c, run)
  const done = new Set(run.log.map(r => r.id))
  return [...phase.keyActions, ...phase.distractors]
    .filter(a => !done.has(a.id))
    .sort((x, y) => (x.id < y.id ? -1 : x.id > y.id ? 1 : 0))
}
