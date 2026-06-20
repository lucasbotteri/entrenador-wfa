import styles from './Chip.module.css'

export type Severity = 'critical' | 'serious' | 'mild'

const LABELS: Record<Severity, string> = { critical: 'Crítico', serious: 'Grave', mild: 'Leve' }

export function Chip({ severity, children }: { severity: Severity; children?: React.ReactNode }) {
  return (
    <span
      className={`${styles.chip} ${styles[severity]}`}
      data-severity={severity}
      aria-label={`Severidad: ${LABELS[severity]}`}
    >
      {children ?? LABELS[severity]}
    </span>
  )
}
