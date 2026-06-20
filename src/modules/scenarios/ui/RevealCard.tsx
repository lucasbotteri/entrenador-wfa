import styles from './scenarios.module.css'

export function RevealCard({ text }: { text: string }) {
  return <div className={styles.reveal}>{text}</div>
}
