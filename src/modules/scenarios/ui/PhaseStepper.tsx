import styles from './scenarios.module.css'

export function PhaseStepper({ count, current }: { count: number; current: number }) {
  return (
    <div className={styles.stepper}>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className={`${styles.step} ${i < current ? styles.done : i === current ? styles.now : ''}`} />
      ))}
    </div>
  )
}
