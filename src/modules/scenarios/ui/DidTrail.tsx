import styles from './scenarios.module.css'

export function DidTrail({ items }: { items: Array<{ id: string; text: string; ok: boolean }> }) {
  if (items.length === 0) return null
  return (
    <div style={{ marginBottom: 'var(--space-3)' }}>
      <div className={styles.didLbl}>Hiciste</div>
      {items.map((it, i) => (
        <div key={it.id} className={styles.did}>
          <span className={`${styles.didN} ${it.ok ? '' : styles.bad}`}>{it.ok ? i + 1 : '✗'}</span>
          {it.text}
        </div>
      ))}
    </div>
  )
}
