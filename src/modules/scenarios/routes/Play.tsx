import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { getCase } from '@/modules/scenarios/content/selectors'
import { buildDebrief } from '@/modules/scenarios/domain/debrief'
import { startRun, act, canAdvance, advance, decide, currentPhase, isLastPhase, remainingBank, type RunState } from '@/modules/scenarios/domain/engine'
import { scoreRun } from '@/modules/scenarios/domain/scoring'
import { saveProgress } from '@/modules/scenarios/domain/store'
import { ActionBank } from '@/modules/scenarios/ui/ActionBank'
import { Debrief } from '@/modules/scenarios/ui/Debrief'
import { DidTrail } from '@/modules/scenarios/ui/DidTrail'
import { DistractorFeedback } from '@/modules/scenarios/ui/DistractorFeedback'
import { EvacuationDecision } from '@/modules/scenarios/ui/EvacuationDecision'
import { PhaseStepper } from '@/modules/scenarios/ui/PhaseStepper'
import { RevealCard } from '@/modules/scenarios/ui/RevealCard'
import { loadCases } from '@/shared/content/loader'
import { phaseShortLabel } from '@/shared/domain/phaseLabels'

export function Play() {
  const { caseId = '' } = useParams()
  const cases = loadCases()
  const c = getCase(cases, caseId)
  const navigate = useNavigate()
  const [run, setRun] = useState<RunState>(() => startRun(caseId))
  const [feedback, setFeedback] = useState<{ type: string; whyNot: string } | null>(null)
  const [finished, setFinished] = useState(false)

  if (!c) return <p>Caso no encontrado.</p>

  const phase = currentPhase(c, run)
  const trailItems = run.log.map(r => {
    const ka = phase.keyActions.find(k => k.id === r.id)
    const da = phase.distractors.find(d => d.id === r.id)
    return { id: r.id, text: ka?.text ?? da?.text ?? r.id, ok: r.correct }
  })

  const onAct = (id: string) => {
    const res = act(c, run, id)
    setRun(res.run)
    setFeedback(res.feedback ?? null)
  }
  const onContinue = () => {
    setFeedback(null)
    if (isLastPhase(c, run)) return // evacuation: handled by decision
    setRun(advance(run))
  }
  const finish = (finalRun: RunState) => {
    const s = scoreRun(c, finalRun)
    void saveProgress(c.id, { ...s, completedAt: new Date().toISOString().slice(0, 10) })
    setFinished(true)
  }
  const onDecide = (level: string) => {
    const next = decide(run, level)
    setRun(next)
    finish(next)
  }
  const onRetry = () => { setRun(startRun(c.id)); setFeedback(null); setFinished(false) }

  if (finished) return <Debrief debrief={buildDebrief(c, run)} onRetry={onRetry} onBack={() => navigate('/scenarios')} />

  const isEvac = phase.decision != null
  const decisionReady = isEvac && canAdvance(c, run)

  return (
    <div>
      <PhaseStepper count={c.phases.length} current={run.phaseIndex} />
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 700 }}>
        {phaseShortLabel(phase.id)}{phase.strictOrder ? ' · orden estricto' : ''}
      </p>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '11px 13px', fontStyle: 'italic', marginBottom: 8 }}>{phase.state}</div>
      {run.revealedTexts.map((t, i) => <RevealCard key={i} text={t} />)}
      <DidTrail items={trailItems} />
      {feedback && <DistractorFeedback type={feedback.type} whyNot={feedback.whyNot} />}

      {decisionReady ? (
        <EvacuationDecision options={phase.decision!.options} onDecide={onDecide} />
      ) : (
        <>
          <p style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: 17 }}>¿Qué hacés?</p>
          <ActionBank actions={remainingBank(c, run)} onAct={onAct} />
          {!isEvac && (
            <button
              onClick={onContinue}
              disabled={!canAdvance(c, run)}
              style={{ width: '100%', marginTop: 10, background: canAdvance(c, run) ? 'var(--ink)' : 'var(--border)', color: canAdvance(c, run) ? 'var(--bg)' : 'var(--muted)', border: 'none', borderRadius: 'var(--radius-lg)', padding: 13, fontFamily: 'var(--font-sans)', fontWeight: 700, minHeight: 44 }}
            >
              Continuar
            </button>
          )}
        </>
      )}
    </div>
  )
}
