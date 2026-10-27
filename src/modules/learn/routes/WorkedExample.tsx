import { Fragment } from 'react'
import { Link } from 'react-router-dom'

import { RecallPrompt } from '@/modules/learn/ui/RecallPrompt'
import { loadContent } from '@/shared/content/loader'
import { buildRationaleMap, getRationale } from '@/shared/domain/rationale'
import { Card } from '@/shared/ui/components/Card'
import { Section } from '@/shared/ui/components/Section'

const tag: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 10,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'var(--muted)',
  margin: 0,
}

const phaseHeading: React.CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontSize: 16,
  fontWeight: 700,
  margin: 'var(--space-3) 0 0',
}

export function WorkedExample() {
  const content = loadContent()
  const map = buildRationaleMap(content)
  const { title, steps, pause } = content.workedExample
  const firstClinicalIdx = steps.findIndex(s => s.phase !== 'scene')
  const phaseName = new Map(content.chain.map(p => [p.phase, p.name]))
  const phaseIndex = new Map(content.chain.map((p, i) => [p.phase, i + 1]))

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, marginBottom: 2 }}>
        Caso resuelto
      </h1>
      <p style={{ fontStyle: 'italic', color: 'var(--ink-soft)', marginTop: 0 }}>{title}</p>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--ink-soft)' }}>
        Una pasada limpia por los cuatro eslabones. Leé el estado, anticipá la acción y recién
        después mirá el porqué.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {steps.map((s, i) => {
          const newPhase = i === 0 || steps[i - 1]?.phase !== s.phase
          return (
            <Fragment key={i}>
              {newPhase && (
                <h2 style={phaseHeading}>
                  Eslabón {phaseIndex.get(s.phase) ?? '?'} · {phaseName.get(s.phase) ?? s.phase}
                </h2>
              )}
              {pause && i === firstClinicalIdx && (
                <RecallPrompt question={pause.question}>
                  <Card>
                    <Section label="Antes de tocar">{pause.reveal}</Section>
                  </Card>
                </RecallPrompt>
              )}
              <Card>
                <p style={tag}>Paso {i + 1}</p>
                <p
                  style={{
                    fontFamily: 'var(--font-serif)',
                    margin: '4px 0',
                    color: 'var(--ink-soft)',
                  }}
                >
                  {s.state}
                </p>
                <p style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, margin: '4px 0' }}>
                  {s.action}
                </p>
                <Section label="Por qué">{getRationale(s.rationaleRef, map) ?? ''}</Section>
              </Card>
            </Fragment>
          )
        })}
      </div>
      <p style={{ marginTop: 'var(--space-5)', fontFamily: 'var(--font-sans)', fontSize: 13 }}>
        <Link to="/">← Volver al mapa de la cadena</Link>
      </p>
    </div>
  )
}
