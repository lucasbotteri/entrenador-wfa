import styles from './StepBadge.module.css'

export function StepBadge({ n, size = 'md' }: { n: number; size?: 'md' | 'lg' }) {
  return (
    <span className={`${styles.badge} ${styles[size]}`} aria-label={`Paso ${n}`}>
      {n}
    </span>
  )
}
