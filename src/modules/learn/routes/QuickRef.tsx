import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { QuickRefTable } from '@/modules/learn/ui/QuickRefTable'
import styles from '@/modules/learn/ui/QuickRefTable.module.css'
import { loadContent } from '@/shared/content/loader'
import type { EvacCriterion } from '@/shared/content/types'
import { Chip, type Severity } from '@/shared/ui/components/Chip'

const SEVERITY_BY_LEVEL: Record<string, Severity> = {
  CRÍTICO: 'critical',
  GRAVE: 'serious',
  LEVE: 'mild',
}

const SECTIONS: Array<[string, string]> = [
  ['vitales', 'Signos vitales'],
  ['reglas', 'Reglas clave'],
  ['siglas', 'Siglas'],
  ['posicion', 'Posición'],
  ['niveles', 'Niveles'],
  ['criterios', 'Criterios por cuadro'],
  ['temas', 'Temas clínicos'],
  ['ayuda', 'Pedir ayuda'],
]

type Rec = Record<string, unknown>
const rec = (v: unknown): Rec =>
  typeof v === 'object' && v !== null && !Array.isArray(v) ? (v as Rec) : {}
const str = (v: unknown): string | undefined => (typeof v === 'string' ? v : undefined)
const strs = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []

function groupByTopic(rows: EvacCriterion[]): Array<[string, EvacCriterion[]]> {
  const out = new Map<string, EvacCriterion[]>()
  for (const r of rows) out.set(r.topic, [...(out.get(r.topic) ?? []), r])
  return [...out.entries()]
}

export function QuickRef() {
  const content = loadContent()
  const { hash } = useLocation()

  useEffect(() => {
    if (hash.length > 1) document.getElementById(hash.slice(1))?.scrollIntoView()
  }, [hash])

  // vitalSigns sub-objects are typed loosely (z.record(z.unknown())); read them tolerantly.
  const vs = content.vitalSigns as Record<string, unknown>
  const rr = rec(vs.respiratoryRate)
  const hr = rec(vs.heartRate)
  const bp = rec(vs.bloodPressure)
  const cap = rec(vs.capillaryRefill)
  const temp = rec(vs.temperature)
  const skin = rec(vs.skin)
  const reeval = rec(vs.reevaluacion)
  const kids = (o: Rec) =>
    [str(o.nino) && `Niños ${o.nino}`, str(o.bebe) && `Bebés ${o.bebe}`].filter(Boolean).join(' · ')

  const vitalRows: Array<[string, string | undefined]> = [
    ['Frecuencia respiratoria (adulto)', str(rr.adulto)],
    ['FR niños / bebés', kids(rr) || undefined],
    ['Frecuencia cardíaca (adulto)', str(hr.adulto)],
    ['FC niños / bebés', kids(hr) || undefined],
    ['Presión arterial', str(bp.normal)],
    [
      'Hipertensión / hipotensión',
      [str(bp.hipertension), str(bp.hipotension)].filter(Boolean).join(' · ') || undefined,
    ],
    ['Relleno capilar', str(cap.normal)],
    ['Temperatura', str(temp.referencia)],
    ['Piel de shock', str(skin.shock)],
    ['Reevaluar (estable)', str(reeval.estable)],
    ['Reevaluar (inestable)', str(reeval.inestable)],
  ]
  const vitalSignRows = vitalRows.filter((r): r is [string, string] => typeof r[1] === 'string')
  const unstableIf = strs(vs.unstableIf)

  const scene = content.chain.find(p => p.phase === 'scene')
  const help = rec(rec(scene?.content).buscar_ayuda)
  const numbers = strs(help.numeros)
  const semData = strs(help.datos_sem)

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, marginBottom: 2 }}>
        Referencia rápida
      </h1>
      <p style={{ fontStyle: 'italic', color: 'var(--ink-soft)', marginTop: 0 }}>
        Para consultar en el terreno. Todo lo de la cadena, compacto.
      </p>

      <nav className={styles.jump} aria-label="Secciones">
        {SECTIONS.map(([id, label]) => (
          <Link key={id} to={`/quickref#${id}`} className={styles.jumpLink}>
            {label}
          </Link>
        ))}
      </nav>

      <h2 className={styles.heading} id="vitales">
        Signos vitales normales
      </h2>
      <QuickRefTable rows={vitalSignRows} />
      {unstableIf.length > 0 && (
        <p className={styles.note}>
          <strong>Es inestable si:</strong> {unstableIf.join(' · ')}.
        </p>
      )}

      {content.practicalRules.length > 0 && (
        <>
          <h2 className={styles.heading} id="reglas">
            Reglas clave
          </h2>
          <ul className={styles.rules}>
            {content.practicalRules.map(r => (
              <li key={r.id}>
                {r.letter && <span className={styles.ruleLetter}>{r.letter}</span>}
                {r.rule}
              </li>
            ))}
          </ul>
        </>
      )}

      <h2 className={styles.heading} id="siglas">
        Siglas
      </h2>
      {content.acronyms.map(a => {
        const rows =
          a.letters?.map(l => [`${l.letter} · ${l.meaning}`, l.detail] as [string, string]) ??
          a.components?.map(c => [c.name, c.detail] as [string, string]) ??
          []
        if (rows.length === 0) return null
        return (
          <div key={a.id}>
            <h3 className={styles.subheading}>
              {a.acronym} · {a.name}
            </h3>
            <QuickRefTable rows={rows} />
          </div>
        )
      })}

      {(content.positions?.length ?? 0) > 0 && (
        <>
          <h2 className={styles.heading} id="posicion">
            Posición de la víctima
          </h2>
          <QuickRefTable
            rows={(content.positions ?? []).map(p => [p.situation, p.position] as [string, string])}
          />
          {content.recoveryPositionSteps.length > 0 && (
            <>
              <h3 className={styles.subheading}>PLS · posición de recuperación</h3>
              <ol className={styles.steps}>
                {content.recoveryPositionSteps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
            </>
          )}
        </>
      )}

      <h2 className={styles.heading} id="niveles">
        Niveles de evacuación
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {content.evacLevels.map(e => (
          <div
            key={e.level}
            style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}
          >
            <Chip severity={SEVERITY_BY_LEVEL[e.level] ?? 'mild'} />
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 14 }}>
              {e.criterion}
              {e.conduct && <span className={styles.conduct}> {e.conduct}</span>}
            </span>
          </div>
        ))}
      </div>

      {content.evacCriteria.length > 0 && (
        <>
          <h2 className={styles.heading} id="criterios">
            Criterios de evacuación por cuadro
          </h2>
          <p className={styles.note}>
            Dado un cuadro concreto, el nivel que indica el manual (capítulos 5 a 15). La nota
            resume la conducta.
          </p>
          {groupByTopic(content.evacCriteria).map(([topic, rows]) => (
            <div key={topic}>
              <h3 className={styles.subheading}>{topic}</h3>
              <ul className={styles.criteria}>
                {rows.map((r, i) => (
                  <li key={`${r.condition}-${i}`} className={styles.criterion}>
                    <Chip severity={SEVERITY_BY_LEVEL[r.level] ?? 'mild'} />
                    <span>
                      <span className={styles.condition}>{r.condition}</span>
                      {r.note && <span className={styles.criterionNote}>{r.note}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </>
      )}

      {content.clinicalTopics.length > 0 && (
        <>
          <h2 className={styles.heading} id="temas">
            Temas clínicos
          </h2>
          {content.clinicalTopics.map(t => (
            <div key={t.id} className={styles.topic}>
              <h3 className={styles.subheading}>{t.name}</h3>
              <p className={styles.topicText}>{t.rationale}</p>
              {t.details && (
                <ul className={styles.steps}>
                  {t.details.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </>
      )}

      {(numbers.length > 0 || semData.length > 0) && (
        <>
          <h2 className={styles.heading} id="ayuda">
            Pedir ayuda
          </h2>
          {semData.length > 0 && (
            <p className={styles.note}>
              <strong>El operador te va a pedir:</strong> {semData.join(' · ')}. No cortes hasta que
              te lo indique.
            </p>
          )}
          {numbers.length > 0 && (
            <QuickRefTable
              rows={numbers.map(n => {
                const i = n.lastIndexOf(' ')
                return [n.slice(0, i), n.slice(i + 1)] as [string, string]
              })}
            />
          )}
        </>
      )}

      <p style={{ marginTop: 'var(--space-5)', fontFamily: 'var(--font-sans)', fontSize: 13 }}>
        <Link to="/">← Volver al mapa de la cadena</Link>
      </p>
    </div>
  )
}
