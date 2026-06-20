import styles from './scenarios.module.css'

export function ActionCard({ id, text, onAct }: { id: string; text: string; onAct: (id: string) => void }) {
  return (
    <button className={styles.bankBtn} onClick={() => onAct(id)}>
      {text}
    </button>
  )
}
