import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

import styles from './ChainMap.module.css'

import { getNodeById } from '@/modules/learn/content/selectors'
import { buildChainModel } from '@/modules/learn/domain/chainModel'
import { PhaseTimeline } from '@/modules/learn/ui/PhaseTimeline'
import { loadContent } from '@/shared/content/loader'
import type { Intro } from '@/shared/content/types'
import { getStorage } from '@/shared/domain/storage'
import { KEYS } from '@/shared/domain/storage/keys'
import { Icon } from '@/shared/ui/components/Icon'

// Advance organizer: the chain in one minute, before any detail (R1.1).
const INTRO_ORDER: Array<[keyof Intro, string]> = [
  ['whatIs', 'Qué es'],
  ['links', 'Los 4 eslabones'],
  ['goal', 'Objetivo'],
  ['flexibility', 'Orden y flexibilidad'],
  ['decision', 'La decisión'],
  ['remote', 'Lugar remoto'],
  ['time', 'El tiempo'],
]

export function ChainMap() {
  const content = loadContent()
  const model = buildChainModel(content)
  const intro = content.intro
  const { hash } = useLocation()
  const [lastNodeId, setLastNodeId] = useState<string | null>(null)

  // Deep links like /#phase-primary scroll to that link of the chain.
  useEffect(() => {
    if (hash.length > 1) document.getElementById(hash.slice(1))?.scrollIntoView()
  }, [hash])

  useEffect(() => {
    let alive = true
    void getStorage()
      .then(kv => kv.get<string>(KEYS.lastLearnNode))
      .then(id => {
        if (alive && typeof id === 'string') setLastNodeId(id)
      })
    return () => {
      alive = false
    }
  }, [])

  const lastNode = lastNodeId ? getNodeById(model, lastNodeId) : null
  const introRows = intro
    ? INTRO_ORDER.map(([key, label]) => [label, intro[key]] as const).filter(
        (r): r is readonly [string, string] => typeof r[1] === 'string',
      )
    : []

  return (
    <div>
      <h1 className={styles.h1}>Cadena de Atención</h1>
      <p className={styles.lead}>Cuatro eslabones, en orden. Tocá un paso para abrirlo.</p>

      {introRows.length > 0 && (
        <details className={styles.intro}>
          <summary className={styles.introSummary}>
            <span className={styles.introIcon}>
              <Icon concept="intro" size={18} />
            </span>
            <span>
              <span className={styles.introTitle}>La cadena en 1 minuto</span>
              <span className={styles.introHint}>{intro?.links}</span>
            </span>
          </summary>
          <dl className={styles.introList}>
            {introRows.map(([label, text]) => (
              <div key={label} className={styles.introRow}>
                <dt>{label}</dt>
                <dd>{text}</dd>
              </div>
            ))}
          </dl>
        </details>
      )}

      {lastNode && (
        <Link to={`/chain/${lastNode.id}`} className={styles.resume}>
          <span className={styles.resumeLabel}>Seguir donde dejaste</span>
          <span className={styles.resumeTitle}>{lastNode.title} →</span>
        </Link>
      )}

      {model.map((phase, i) => (
        <PhaseTimeline key={phase.id} phase={phase} index={i} />
      ))}

      <div className={styles.quickLinks}>
        <Link to="/example" className={styles.quickLink}>
          📘 Caso resuelto
        </Link>
        <Link to="/quickref" className={styles.quickLink}>
          📋 Ver todo
        </Link>
      </div>
    </div>
  )
}
