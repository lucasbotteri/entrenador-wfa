import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { allCases } from '@/modules/scenarios/content/selectors'
import { loadProgress, type CaseProgress } from '@/modules/scenarios/domain/store'
import { loadCases } from '@/shared/content/loader'

export function ScenariosHome() {
  const cases = allCases(loadCases())
  const [progress, setProgress] = useState<Record<string, CaseProgress>>({})
  useEffect(() => { void loadProgress().then(setProgress) }, [])
  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 24 }}>Escenarios</h1>
      <p style={{ color: 'var(--ink-soft)' }}>Casos integrales: actuá toda la cadena.</p>
      {cases.map(c => {
        const p = progress[c.id]
        return (
          <Link key={c.id} to={`/scenarios/${c.id}`} style={{ display: 'block', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', marginBottom: 'var(--space-3)', textDecoration: 'none', color: 'var(--ink)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: 17 }}>{c.title}</span>
              {p && <span style={{ fontFamily: 'var(--font-sans)', fontSize: 10, background: 'var(--mild)', color: 'var(--on-mild)', borderRadius: 'var(--radius-pill)', padding: '2px 8px' }}>✓ {p.criticalDone}/{p.criticalTotal}</span>}
            </div>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--muted)', margin: '2px 0 6px' }}>{c.tag}</p>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: 13, margin: 0 }}>{c.context.slice(0, 120)}…</p>
          </Link>
        )
      })}
    </div>
  )
}
