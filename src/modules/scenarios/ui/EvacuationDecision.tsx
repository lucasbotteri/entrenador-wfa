import styles from './scenarios.module.css'

export function EvacuationDecision({ options, onDecide }: { options: Array<{ level: string }>; onDecide: (level: string) => void }) {
  return (
    <div>
      <p style={{ fontFamily: 'var(--font-serif)', fontWeight: 700 }}>Decisión de evacuación</p>
      {options.map(o => (
        <button key={o.level} className={styles.bankBtn} onClick={() => onDecide(o.level)}>
          {o.level}
        </button>
      ))}
    </div>
  )
}
