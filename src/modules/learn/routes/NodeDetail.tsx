import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'

import styles from './NodeDetail.module.css'

import { getNodeById, getPhaseForNode } from '@/modules/learn/content/selectors'
import { buildChainModel, type ChainNode } from '@/modules/learn/domain/chainModel'
import { findPrevNext } from '@/modules/learn/domain/navigation'
import { ExpandableItem } from '@/modules/learn/ui/ExpandableItem'
import { RecallPrompt } from '@/modules/learn/ui/RecallPrompt'
import { loadContent } from '@/shared/content/loader'
import { phaseShortLabel } from '@/shared/domain/phaseLabels'
import { buildRationaleMap, getRationale } from '@/shared/domain/rationale'
import { getStorage } from '@/shared/domain/storage'
import { KEYS } from '@/shared/domain/storage/keys'
import { Breadcrumb } from '@/shared/ui/components/Breadcrumb'
import { Card } from '@/shared/ui/components/Card'
import { Icon } from '@/shared/ui/components/Icon'
import { LetterBadge } from '@/shared/ui/components/LetterBadge'
import { Section } from '@/shared/ui/components/Section'
import { StepBadge } from '@/shared/ui/components/StepBadge'

// Compact label for a sibling chip: the mnemonic letter or step number when the
// node has one (that is the order language of the phase), else its title.
function chipLabel(n: ChainNode): string {
  if (n.letter) return n.letter
  if (n.order != null) return String(n.order)
  return n.title
}

export function NodeDetail() {
  const { nodeId = '' } = useParams()
  const content = loadContent()
  const model = buildChainModel(content)
  const node = getNodeById(model, nodeId)
  const where = getPhaseForNode(model, nodeId)
  const why =
    node?.whyText ??
    (node?.rationaleId ? getRationale(node.rationaleId, buildRationaleMap(content)) : undefined)
  const { prev, next } = findPrevNext(model, nodeId)
  const nextWhere = next ? getPhaseForNode(model, next.id) : null
  const nextInSamePhase = Boolean(
    next && where && nextWhere && nextWhere.phase.id === where.phase.id,
  )

  useEffect(() => {
    if (node) void getStorage().then(kv => kv.set(KEYS.lastLearnNode, node.id))
  }, [node])

  if (!node) {
    return (
      <p>
        Nodo no encontrado. <Link to="/">Volver al mapa</Link>
      </p>
    )
  }

  const hasBadge = node.order != null || Boolean(node.letter)

  return (
    <article>
      <Breadcrumb
        items={[
          { label: 'Cadena', to: '/' },
          ...(where
            ? [
                {
                  label: phaseShortLabel(where.phase.id),
                  to: `/#phase-${where.phase.id}`,
                },
              ]
            : []),
          { label: node.title },
        ]}
      />

      {where && (
        <>
          <p className={styles.context}>
            Eslabón {where.phaseIndex + 1} · paso {where.position + 1} de {where.phase.nodes.length}
          </p>
          <nav className={styles.strip} aria-label="Pasos de este eslabón">
            {where.phase.nodes.map(n => {
              const on = n.id === node.id
              return (
                <Link
                  key={n.id}
                  to={`/chain/${n.id}`}
                  className={`${styles.chip} ${on ? styles.chipOn : ''}`}
                  aria-current={on ? 'page' : undefined}
                  title={n.title}
                >
                  {chipLabel(n)}
                </Link>
              )
            })}
          </nav>
        </>
      )}

      <div className={styles.lead}>
        {node.order != null ? (
          <StepBadge n={node.order} size="lg" />
        ) : node.letter ? (
          <LetterBadge letter={node.letter} size="lg" />
        ) : null}
        {node.icon && (
          <span className={`${styles.iconBox} ${hasBadge ? styles.iconBoxSmall : ''}`}>
            <Icon concept={node.icon} size={hasBadge ? 22 : 30} />
          </span>
        )}
      </div>
      <h1 className={styles.h1}>
        {node.title}
        {node.priority && <span className={styles.prio}>prioridad</span>}
      </h1>
      {node.subtitle && <p className={styles.subtitle}>{node.subtitle}</p>}

      {node.items.map((it, i) => (
        <ExpandableItem key={`${it.label}-${i}`} item={it} />
      ))}

      {why && (
        <div className={styles.block}>
          <RecallPrompt key={`why-${nodeId}`} question="¿Por qué?">
            <Section label="Por qué">{why}</Section>
          </RecallPrompt>
        </div>
      )}

      {next && (
        <div className={styles.block}>
          <RecallPrompt
            key={`next-${nodeId}`}
            question={nextInSamePhase ? '¿Qué paso sigue?' : '¿Qué eslabón sigue?'}
          >
            <Card>
              <Section label={nextInSamePhase ? 'Siguiente paso' : 'Siguiente eslabón'}>
                <span className={styles.nextTitle}>
                  {next.letter ? `${next.letter} · ` : next.order != null ? `${next.order} · ` : ''}
                  {next.title}
                </span>
                {!nextInSamePhase && nextWhere && (
                  <span className={styles.nextPhase}> — {nextWhere.phase.title}</span>
                )}
              </Section>
            </Card>
          </RecallPrompt>
        </div>
      )}

      <nav className={styles.pager} aria-label="Anterior y siguiente">
        {prev ? (
          <Link to={`/chain/${prev.id}`} className={styles.pagerLink}>
            ← Anterior
          </Link>
        ) : (
          <span />
        )}
        <Link to="/" className={styles.pagerMap}>
          Mapa
        </Link>
        {next ? (
          <Link to={`/chain/${next.id}`} className={styles.pagerLink}>
            Siguiente →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  )
}
