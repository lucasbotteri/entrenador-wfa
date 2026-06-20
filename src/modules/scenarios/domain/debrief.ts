import type { RunState } from './engine'
import { scoreRun, type RunScore } from './scoring'

import type { Case } from '@/shared/content/types'
import { linkForRef } from '@/shared/domain/conceptLinks'

export interface DebriefItem { text: string; concept: string; link: string }
export interface Debrief {
  summary: RunScore
  did: DebriefItem[]
  missed: DebriefItem[]
  dangerous: DebriefItem[]
  priorities: { ok: boolean; text: string }
  evacuation?: { chosen?: string; correct: string; ok: boolean; feedback: string }
}

function item(text: string, concept: string): DebriefItem {
  return { text, concept, link: linkForRef(concept) }
}

export function buildDebrief(c: Case, run: RunState): Debrief {
  const summary = scoreRun(c, run)
  const done = new Set(run.log.map(r => r.id))

  const did: DebriefItem[] = []
  const missed: DebriefItem[] = []
  for (const phase of c.phases) {
    for (const k of phase.keyActions) {
      const rec = run.log.find(r => r.id === k.id)
      if (rec && rec.correct) did.push(item(k.text, k.concept))
      else if (k.critical && !done.has(k.id)) missed.push(item(k.text, k.concept))
    }
  }

  const dangerous: DebriefItem[] = []
  for (const phase of c.phases) {
    for (const d of phase.distractors) {
      if (done.has(d.id)) dangerous.push({ text: d.text, concept: d.concept, link: linkForRef(d.concept) })
    }
  }

  const skipped = run.log.some(r => r.skippedCritical)
  const priorities = {
    ok: summary.prioritiesOk,
    text: skipped
      ? 'Saltaste el control de hemorragia masiva (H) — lo primero que mata, primero.'
      : summary.prioritiesOk
        ? 'Respetaste el orden de prioridad vital.'
        : 'Hiciste acciones fuera del orden de prioridad.',
  }

  const evacPhase = c.phases.find(p => p.decision)
  let evacuation: Debrief['evacuation']
  if (evacPhase?.decision) {
    const chosen = run.decision
    const opt = evacPhase.decision.options.find(o => o.level === chosen)
    evacuation = {
      ...(chosen ? { chosen } : {}),
      correct: evacPhase.decision.correct,
      ok: chosen === evacPhase.decision.correct,
      feedback: opt?.feedback ?? '',
    }
  }

  return { summary, did, missed, dangerous, priorities, ...(evacuation ? { evacuation } : {}) }
}
