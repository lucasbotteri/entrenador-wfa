import styles from './MasteryBars.module.css'

import type { TopicMastery } from '@/modules/practice/domain/mastery'

export function MasteryBars({ items }: { items: TopicMastery[] }) {
  return (
    <div>
      {items.map(t => (
        <div key={t.topic} className={`${styles.row} ${t.enabled ? '' : styles.disabled}`}>
          <div className={styles.head}>
            <span>{t.topic}</span>
            {t.enabled ? (
              <span className={styles.pct}>{t.pct}%</span>
            ) : (
              <span className={styles.tag}>Aún no visto en clase</span>
            )}
          </div>
          {t.enabled && (
            <div className={styles.bar}>
              <span
                className={`${styles.fill} ${t.pct < 50 ? styles.low : t.pct < 80 ? styles.mid : ''}`}
                style={{ width: `${t.pct}%`, display: 'block' }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
