import { QuickRefTable } from '@/modules/learn/ui/QuickRefTable'
import styles from '@/modules/learn/ui/QuickRefTable.module.css'
import { loadContent } from '@/shared/content/loader'
import { Chip, type Severity } from '@/shared/ui/components/Chip'

const SEVERITY_BY_LEVEL: Record<string, Severity> = {
  CRÍTICO: 'critical',
  GRAVE: 'serious',
  LEVE: 'mild',
}

export function QuickRef() {
  const content = loadContent()
  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 24 }}>Referencia rápida</h1>

      <h2 className={styles.heading}>Siglas</h2>
      {content.acronyms.map(a => (
        <div key={a.id}>
          <h3
            style={{ fontFamily: 'var(--font-serif)', margin: 'var(--space-3) 0 var(--space-1)' }}
          >
            {a.acronym} · {a.name}
          </h3>
          <QuickRefTable
            rows={
              a.letters?.map(l => [`${l.letter} · ${l.meaning}`, l.detail] as [string, string]) ??
              a.components?.map(c => [c.name, c.detail] as [string, string]) ??
              []
            }
          />
        </div>
      ))}

      <h2 className={styles.heading}>Niveles de evacuación</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {content.evacLevels.map(e => (
          <div
            key={e.level}
            style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}
          >
            <Chip severity={SEVERITY_BY_LEVEL[e.level] ?? 'mild'} />
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 14 }}>{e.criterion}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
