import { NodeCard } from './NodeCard'
import styles from './PhaseTimeline.module.css'

import type { ChainPhase } from '@/modules/learn/domain/chainModel'

export function PhaseTimeline({ phase, index }: { phase: ChainPhase; index: number }) {
  return (
    <section className={styles.phase}>
      <p className={styles.label}>Fase {index}</p>
      <h2 className={styles.title}>{phase.title}</h2>
      <div className={styles.nodes}>
        {phase.nodes.map(n => (
          <NodeCard key={n.id} node={n} />
        ))}
      </div>
    </section>
  )
}
