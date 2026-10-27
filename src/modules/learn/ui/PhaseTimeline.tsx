import { Fragment } from 'react'

import { NodeCard } from './NodeCard'
import styles from './PhaseTimeline.module.css'

import type { ChainPhase } from '@/modules/learn/domain/chainModel'

export function PhaseTimeline({ phase, index }: { phase: ChainPhase; index: number }) {
  return (
    <section
      className={styles.phase}
      id={`phase-${phase.id}`}
      aria-labelledby={`phase-${phase.id}-title`}
    >
      <p className={styles.label}>Eslabón {index + 1}</p>
      <h2 className={styles.title} id={`phase-${phase.id}-title`}>
        {phase.title}
      </h2>
      {phase.questions && phase.questions.length > 0 && (
        <ul className={styles.questions} aria-label="Preguntas guía">
          {phase.questions.map(q => (
            <li key={q}>{q}</li>
          ))}
        </ul>
      )}
      <div className={styles.nodes}>
        {phase.nodes.map(n => (
          <Fragment key={n.id}>
            {n.kind === 'bridge' && (
              <p className={styles.connector} aria-hidden>
                ↓
              </p>
            )}
            <NodeCard node={n} />
          </Fragment>
        ))}
      </div>
    </section>
  )
}
