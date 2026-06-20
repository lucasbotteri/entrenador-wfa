import { Fragment } from 'react'

import { RecallPrompt } from '@/modules/learn/ui/RecallPrompt'
import { loadContent } from '@/shared/content/loader'
import { buildRationaleMap, getRationale } from '@/shared/domain/rationale'
import { Card } from '@/shared/ui/components/Card'
import { Section } from '@/shared/ui/components/Section'

export function WorkedExample() {
  const content = loadContent()
  const map = buildRationaleMap(content)
  const { title, steps, pause } = content.workedExample
  const firstClinicalIdx = steps.findIndex(s => s.phase !== 'scene')

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 24 }}>Caso resuelto</h1>
      <p style={{ fontStyle: 'italic', color: 'var(--ink-soft)' }}>{title}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {steps.map((s, i) => (
          <Fragment key={i}>
            {pause && i === firstClinicalIdx && (
              <RecallPrompt question={pause.question}>
                <Card>
                  <Section label="Antes de tocar">{pause.reveal}</Section>
                </Card>
              </RecallPrompt>
            )}
            <Card>
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 10,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--muted)',
                  margin: 0,
                }}
              >
                Paso {i + 1}
              </p>
              <p style={{ fontFamily: 'var(--font-serif)', margin: '4px 0' }}>{s.state}</p>
              <p style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, margin: '4px 0' }}>
                {s.action}
              </p>
              <Section label="Por qué">{getRationale(s.rationaleRef, map) ?? ''}</Section>
            </Card>
          </Fragment>
        ))}
      </div>
    </div>
  )
}
