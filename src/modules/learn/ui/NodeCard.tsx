import { Link } from 'react-router-dom'

import styles from './NodeCard.module.css'

import type { ChainNode } from '@/modules/learn/domain/chainModel'
import { Icon } from '@/shared/ui/components/Icon'
import { LetterBadge } from '@/shared/ui/components/LetterBadge'


export function NodeCard({ node }: { node: ChainNode }) {
  return (
    <Link to={`/chain/${node.id}`} className={styles.card}>
      {node.letter ? (
        <LetterBadge letter={node.letter} />
      ) : node.icon ? (
        <span className={styles.iconBox}>
          <Icon concept={node.icon} />
        </span>
      ) : null}
      <span className={styles.body}>
        <p className={styles.title}>{node.title}</p>
        {node.subtitle && <p className={styles.meta}>{node.subtitle}</p>}
      </span>
      <span className={styles.arrow} aria-hidden>
        ›
      </span>
    </Link>
  )
}
