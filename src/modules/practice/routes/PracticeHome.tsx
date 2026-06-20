import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { getDueCards } from '@/modules/practice/content/selectors'
import { todayIso } from '@/modules/practice/domain/dates'
import { masteryByTopic, type TopicMastery } from '@/modules/practice/domain/mastery'
import { loadStates, loadStreak } from '@/modules/practice/domain/store'
import { MasteryBars } from '@/modules/practice/ui/MasteryBars'
import { loadContent } from '@/shared/content/loader'

export function PracticeHome() {
  const content = loadContent()
  const [due, setDue] = useState(0)
  const [streak, setStreak] = useState(0)
  const [mastery, setMastery] = useState<TopicMastery[]>([])

  useEffect(() => {
    const today = todayIso()
    void Promise.all([loadStates(), loadStreak()]).then(([states, s]) => {
      setDue(getDueCards(content.cards, states, today).length)
      setStreak(s.current)
      setMastery(masteryByTopic(content.cards, states))
    })
  }, [content])

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 24 }}>Repaso de hoy</h1>
      <p style={{ color: 'var(--ink-soft)' }}>{due === 0 ? 'Al día ✓' : `${due} tarjeta${due === 1 ? '' : 's'} para repasar`}</p>
      <Link
        to="/practice/session"
        style={{
          display: 'inline-block', background: 'var(--primary)', color: 'var(--on-critical)',
          padding: '12px 18px', borderRadius: 'var(--radius-lg)', fontFamily: 'var(--font-sans)',
          fontWeight: 700, textDecoration: 'none', minHeight: 44,
        }}
      >
        Empezar sesión
      </Link>
      {streak > 0 && <p style={{ fontFamily: 'var(--font-sans)', marginTop: 'var(--space-4)' }}>🔥 Racha de {streak} día{streak === 1 ? '' : 's'}</p>}
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 16, marginTop: 'var(--space-5)' }}>Dominio por tema</h2>
      <MasteryBars items={mastery} />
    </div>
  )
}
