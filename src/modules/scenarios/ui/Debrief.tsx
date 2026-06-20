import { Link } from 'react-router-dom'

import type { Debrief as DebriefModel, DebriefItem } from '@/modules/scenarios/domain/debrief'

function Section({ label, items }: { label: string; items: DebriefItem[] }) {
  if (items.length === 0) return null
  return (
    <div style={{ marginBottom: 'var(--space-4)' }}>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 700, marginBottom: 6 }}>{label}</div>
      {items.map((it, i) => (
        <div key={i} style={{ fontSize: 14, padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
          {it.text}
          {it.detail && (
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 13, color: 'var(--ink-soft)', marginTop: 2 }}>
              {it.detail}
            </div>
          )}
          {it.link !== '/' && (
            <>
              <br />
              <Link to={it.link} style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--primary)', fontWeight: 600 }}>
                Ver "{it.concept}" en Aprender →
              </Link>
            </>
          )}
        </div>
      ))}
    </div>
  )
}

export function Debrief({ debrief, onRetry, onBack }: { debrief: DebriefModel; onRetry: () => void; onBack: () => void }) {
  const s = debrief.summary
  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 24 }}>Debrief</h1>
      <div style={{ background: 'var(--ink)', color: 'var(--bg)', borderRadius: 'var(--radius-lg)', padding: '11px 13px', fontFamily: 'var(--font-sans)', fontSize: 12, marginBottom: 'var(--space-4)' }}>
        decisiones críticas {s.criticalDone}/{s.criticalTotal} · errores peligrosos {s.dangerous} · prioridades {s.prioritiesOk ? '✓' : '✗'}
      </div>
      <Section label="✅ Hiciste" items={debrief.did} />
      <Section label="⚠️ Te faltó" items={debrief.missed} />
      <Section label="❌ Peligroso" items={debrief.dangerous} />
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 700, marginBottom: 6 }}>🧭 Prioridades</div>
        <div style={{ fontSize: 14 }}>{debrief.priorities.text}</div>
      </div>
      {debrief.evacuation && (
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 700, marginBottom: 6 }}>🏁 Evacuación</div>
          <div style={{ fontSize: 14 }}>
            {debrief.evacuation.chosen ?? '—'} {debrief.evacuation.ok ? '✓' : `✗ (correcta: ${debrief.evacuation.correct})`} — {debrief.evacuation.feedback}
          </div>
        </div>
      )}
      <button onClick={onRetry} style={{ width: '100%', background: 'var(--primary)', color: 'var(--on-critical)', border: 'none', borderRadius: 'var(--radius-lg)', padding: 13, fontFamily: 'var(--font-sans)', fontWeight: 700, minHeight: 44 }}>
        Reintentar el caso
      </button>
      <button onClick={onBack} style={{ width: '100%', background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 11, marginTop: 8, fontFamily: 'var(--font-sans)', fontWeight: 600, minHeight: 44 }}>
        Volver a Escenarios
      </button>
    </div>
  )
}
