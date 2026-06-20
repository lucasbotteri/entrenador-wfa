import { Link } from 'react-router-dom'

import { buildChainModel } from '@/modules/learn/domain/chainModel'
import { PhaseTimeline } from '@/modules/learn/ui/PhaseTimeline'
import { loadContent } from '@/shared/content/loader'

export function ChainMap() {
  const content = loadContent()
  const model = buildChainModel(content)
  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, margin: '0 0 4px' }}>
        Cadena de Atención
      </h1>
      <p style={{ fontStyle: 'italic', color: 'var(--ink-soft)', marginTop: 0 }}>
        tocá un paso para abrirlo
      </p>
      {model.map((phase, i) => (
        <PhaseTimeline key={phase.id} phase={phase} index={i} />
      ))}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
        <Link to="/example" style={quickLink}>
          📘 Caso resuelto
        </Link>
        <Link to="/quickref" style={quickLink}>
          📋 Ver todo
        </Link>
      </div>
    </div>
  )
}

const quickLink: React.CSSProperties = {
  flex: 1,
  padding: '10px 12px',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-md)',
  textAlign: 'center',
  fontWeight: 600,
  fontFamily: 'var(--font-sans)',
  fontSize: 12,
}
