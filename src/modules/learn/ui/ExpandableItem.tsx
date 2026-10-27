import { Link } from 'react-router-dom'

import styles from './ExpandableItem.module.css'

import type { NodeItem } from '@/modules/learn/domain/chainModel'

// One idea per row: label + detail. List-valued details render as bullets; a
// detail sentence that is just the joined bullets is not repeated.
export function ExpandableItem({ item }: { item: NodeItem }) {
  const bullets = item.bullets
  const showDetail = Boolean(item.detail) && (!bullets || item.detail !== bullets.join(' · '))
  return (
    <div className={styles.item}>
      {item.heading && <p className={styles.heading}>{item.heading}</p>}
      <p className={styles.label}>{item.label}</p>
      {showDetail && <p className={styles.detail}>{item.detail}</p>}
      {bullets && (
        <ul className={styles.list}>
          {bullets.map((b, i) => (
            <li key={`${b}-${i}`}>{b}</li>
          ))}
        </ul>
      )}
      {item.why && <p className={styles.why}>{item.why}</p>}
      {item.link && (
        <Link to={item.link.to} className={styles.link}>
          {item.link.label} →
        </Link>
      )}
    </div>
  )
}
