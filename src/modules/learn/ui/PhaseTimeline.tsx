import { Fragment } from 'react'

import { NodeCard } from './NodeCard'
import styles from './PhaseTimeline.module.css'

import type { ChainPhase } from '@/modules/learn/domain/chainModel'

export function PhaseTimeline({ phase, index }: { phase: ChainPhase; index: number }) {
  return (
    <section className={styles.phase}>
      <p className={styles.label}>Eslabón {index + 1}</p>
      <h2 className={styles.title}>{phase.title}</h2>
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
