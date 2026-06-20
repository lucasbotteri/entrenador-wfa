import styles from './scenarios.module.css'

export function DistractorFeedback({ type, whyNot }: { type: string; whyNot: string }) {
  return (
    <div className={styles.fb}>
      <span className={styles.fbTag}>{type}</span>
      <div className={styles.fbWhy}>{whyNot}</div>
    </div>
  )
}
