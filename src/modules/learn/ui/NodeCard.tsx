import { Link } from 'react-router-dom'

import styles from './NodeCard.module.css'

import type { ChainNode } from '@/modules/learn/domain/chainModel'
import { Icon } from '@/shared/ui/components/Icon'
import { LetterBadge } from '@/shared/ui/components/LetterBadge'
import { StepBadge } from '@/shared/ui/components/StepBadge'

export function NodeCard({ node }: { node: ChainNode }) {
  const lead =
    node.kind === 'bridge' ? (
      <span className={styles.iconBox}>
        <Icon concept="help" />
      </span>
    ) : node.order != null ? (
      <StepBadge n={node.order} />
    ) : node.letter ? (
      <LetterBadge letter={node.letter} />
    ) : node.icon ? (
      <span className={styles.iconBox}>
        <Icon concept={node.icon} />
      </span>
    ) : null

  return (
    <Link to={`/chain/${node.id}`} className={`${styles.card} ${node.kind === 'bridge' ? styles.bridge : ''}`}>
      {lead}
      <span className={styles.body}>
        <p className={styles.title}>
          {node.title}
          {node.priority && <span className={styles.prio}>prioridad</span>}
        </p>
        {node.subtitle && <p className={styles.meta}>{node.subtitle}</p>}
      </span>
      <span className={styles.arrow} aria-hidden>
        ›
      </span>
    </Link>
  )
}
