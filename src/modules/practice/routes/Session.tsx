import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { todayIso } from '@/modules/practice/domain/dates'
import { inScopeCards } from '@/modules/practice/domain/scope'
import { buildSession } from '@/modules/practice/domain/session'
import { loadStates, loadStreak, saveStreak } from '@/modules/practice/domain/store'
import { updateStreak } from '@/modules/practice/domain/streak'
import { SessionRunner, type SessionSummary } from '@/modules/practice/ui/SessionRunner'
import { loadContent } from '@/shared/content/loader'
import type { Card } from '@/shared/content/types'
import { buildRationaleMap } from '@/shared/domain/rationale'

export function Session() {
  const content = loadContent()
  const map = useMemo(() => buildRationaleMap(content), [content])
  const today = todayIso()
  const [queue, setQueue] = useState<Card[] | null>(null)
  const [done, setDone] = useState<SessionSummary | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadStates().then(states => setQueue(buildSession(inScopeCards(content.cards), states, today)))
  }, [content, today])

  const onDone = async (s: SessionSummary) => {
    const streak = await loadStreak()
    await saveStreak(updateStreak(streak, today))
    setDone(s)
  }

  if (done) {
    return (
      <div>
        <h1 style={{ fontFamily: 'var(--font-serif)' }}>Sesión terminada</h1>
        <p>Aciertos: {done.correct} · A repasar: {done.wrong}</p>
        <button onClick={() => navigate('/practice')} style={{ minHeight: 44 }}>Volver a Practicar</button>
      </div>
    )
  }
  if (!queue) return <p>Cargando…</p>
  if (queue.length === 0) return <p>No hay tarjetas para repasar. <button onClick={() => navigate('/practice')}>Volver</button></p>
  return <SessionRunner queue={queue} rationaleMap={map} today={today} onDone={onDone} />
}
