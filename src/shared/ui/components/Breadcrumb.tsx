import { Link } from 'react-router-dom'

import styles from './Breadcrumb.module.css'

export interface Crumb { label: string; to?: string }

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav className={styles.nav} aria-label="Migas de pan">
      <ol className={styles.list}>
        {items.map((c, i) => (
          <li key={`${c.label}-${i}`}>
            {c.to ? <Link to={c.to}>{c.label}</Link> : <span>{c.label}</span>}
            {i < items.length - 1 && <span className={styles.sep}> / </span>}
          </li>
        ))}
      </ol>
    </nav>
  )
}
