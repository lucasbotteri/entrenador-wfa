import styles from './ExpandableItem.module.css'

import type { NodeItem } from '@/modules/learn/domain/chainModel'

export function ExpandableItem({ item }: { item: NodeItem }) {
  return (
    <div className={styles.item}>
      {item.heading && <p className={styles.heading}>{item.heading}</p>}
      <p className={styles.label}>{item.label}</p>
      {item.detail && <p className={styles.detail}>{item.detail}</p>}
      {item.why && <p className={styles.why}>{item.why}</p>}
    </div>
  )
}
