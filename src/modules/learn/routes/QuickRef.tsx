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

  // vitalSigns sub-objects are typed loosely (z.record(z.unknown())); cast to a
  // narrow shape so we can index inner keys, and coerce values via the .filter.
  const vs = content.vitalSigns as Record<string, Record<string, string> | undefined>
  const vitalRows: Array<[string, string | undefined]> = [
    ['Frecuencia cardíaca (adulto)', vs.heartRate?.adulto],
    ['Frecuencia respiratoria (adulto)', vs.respiratoryRate?.adulto],
    ['Presión arterial', vs.bloodPressure?.normal],
    ['Relleno capilar', vs.capillaryRefill?.normal],
  ]
  const vitalSignRows = vitalRows.filter(
    (r): r is [string, string] => typeof r[1] === 'string',
  )

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 24 }}>Referencia rápida</h1>

      <h2 className={styles.heading}>Signos vitales normales</h2>
      <QuickRefTable rows={vitalSignRows} />

      <h2 className={styles.heading}>Siglas</h2>
      {content.acronyms.map(a => {
        const rows =
          a.letters?.map(l => [`${l.letter} · ${l.meaning}`, l.detail] as [string, string]) ??
          a.components?.map(c => [c.name, c.detail] as [string, string]) ??
          []
        if (rows.length === 0) return null
        return (
          <div key={a.id}>
            <h3
              style={{ fontFamily: 'var(--font-serif)', margin: 'var(--space-3) 0 var(--space-1)' }}
            >
              {a.acronym} · {a.name}
            </h3>
            <QuickRefTable rows={rows} />
          </div>
        )
      })}

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
