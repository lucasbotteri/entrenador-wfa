import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'

import { getNodeById } from '@/modules/learn/content/selectors'
import { buildChainModel } from '@/modules/learn/domain/chainModel'
import { findPrevNext } from '@/modules/learn/domain/navigation'
import { ExpandableItem } from '@/modules/learn/ui/ExpandableItem'
import { loadContent } from '@/shared/content/loader'
import { buildRationaleMap, getRationale } from '@/shared/domain/rationale'
import { getStorage } from '@/shared/domain/storage'
import { KEYS } from '@/shared/domain/storage/keys'
import { Breadcrumb } from '@/shared/ui/components/Breadcrumb'
import { Icon } from '@/shared/ui/components/Icon'
import { LetterBadge } from '@/shared/ui/components/LetterBadge'
import { Section } from '@/shared/ui/components/Section'
import { StepBadge } from '@/shared/ui/components/StepBadge'

export function NodeDetail() {
  const { nodeId = '' } = useParams()
  const content = loadContent()
  const model = buildChainModel(content)
  const node = getNodeById(model, nodeId)
  const rationale = node?.rationaleId
    ? getRationale(node.rationaleId, buildRationaleMap(content))
    : undefined
  const { prev, next } = findPrevNext(model, nodeId)

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

  return (
    <article>
      <Breadcrumb items={[{ label: 'Cadena', to: '/' }, { label: node.title }]} />
      <div style={{ margin: 'var(--space-3) 0' }}>
        {node.order != null ? (
          <StepBadge n={node.order} size="lg" />
        ) : node.letter ? (
          <LetterBadge letter={node.letter} size="lg" />
        ) : node.icon ? (
          <Icon concept={node.icon} size={32} />
        ) : null}
      </div>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, margin: '0 0 2px' }}>
        {node.title}
        {node.priority && (
          <span
            style={{
              marginLeft: 8, padding: '1px 6px', borderRadius: 'var(--radius-pill)',
              background: 'var(--primary)', color: 'var(--on-critical)',
              fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 700,
              letterSpacing: '0.06em', textTransform: 'uppercase', verticalAlign: 'middle',
            }}
          >
            prioridad
          </span>
        )}
      </h1>
      {node.subtitle && (
        <p style={{ fontStyle: 'italic', color: 'var(--ink-soft)', marginTop: 0 }}>
          {node.subtitle}
        </p>
      )}

      {node.items.map((it, i) => (
        <ExpandableItem key={`${it.label}-${i}`} item={it} />
      ))}

      {rationale && (
        <div style={{ marginTop: 'var(--space-4)' }}>
          <Section label="Por qué">{rationale}</Section>
        </div>
      )}

      <nav
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 'var(--space-5)',
          fontFamily: 'var(--font-sans)',
          fontSize: 13,
        }}
      >
        {prev ? (
          <Link to={`/chain/${prev.id}`} style={{ display: 'inline-block', padding: 'var(--space-3) var(--space-2)', minHeight: 44 }}>
            ← Anterior
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to={`/chain/${next.id}`} style={{ display: 'inline-block', padding: 'var(--space-3) var(--space-2)', minHeight: 44 }}>
            Siguiente →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  )
}
