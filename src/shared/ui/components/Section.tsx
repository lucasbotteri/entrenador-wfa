import styles from './Section.module.css'

export function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className={styles.label}>{label}</p>
      <div className={styles.body}>{children}</div>
    </div>
  )
}
