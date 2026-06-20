import { render, screen } from '@testing-library/react'
import { HashRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'

import type { ChainNode } from '@/modules/learn/domain/chainModel'
import { ExpandableItem } from '@/modules/learn/ui/ExpandableItem'
import { NodeCard } from '@/modules/learn/ui/NodeCard'

const node: ChainNode = {
  id: 'primary-habcde-h',
  phase: 'primary',
  title: 'Hemorragia',
  subtitle: 'Paso H de HABCDE',
  letter: 'H',
  kind: 'acronymLetter',
  items: [{ label: 'Hemorragia', detail: 'Detener.' }],
  rationaleId: 'habcde',
}

describe('learn ui', () => {
  it('NodeCard links to the node detail and shows its title', () => {
    render(
      <HashRouter>
        <NodeCard node={node} />
      </HashRouter>,
    )
    const link = screen.getByRole('link', { name: /Hemorragia/i })
    expect(link).toHaveAttribute('href', '#/chain/primary-habcde-h')
  })

  it('ExpandableItem shows label and detail', () => {
    render(<ExpandableItem item={{ label: 'Alerta', detail: 'Orientada.' }} />)
    expect(screen.getByText('Alerta')).toBeInTheDocument()
    expect(screen.getByText('Orientada.')).toBeInTheDocument()
  })
})

describe('fixes ui', () => {
  it('ExpandableItem renders a heading when present', () => {
    render(<ExpandableItem item={{ label: 'Qué es', detail: 'x', heading: 'Bioseguridad' }} />)
    expect(screen.getByText('Bioseguridad')).toBeInTheDocument()
  })
  it('NodeCard renders a StepBadge + priority marker for an ordered node', () => {
    const node: ChainNode = {
      id: 'scene-safety', phase: 'scene', title: 'Seguridad', order: 1, priority: true,
      kind: 'topic', items: [], rationaleId: 'scene',
    }
    render(<HashRouter><NodeCard node={node} /></HashRouter>)
    expect(screen.getByLabelText('Paso 1')).toBeInTheDocument()
    expect(screen.getByText('prioridad')).toBeInTheDocument()
  })
  it('NodeCard renders the bridge variant with the help icon', () => {
    const node: ChainNode = { id: 'scene-help', phase: 'scene', title: 'Buscar ayuda', kind: 'bridge', items: [] }
    const { container } = render(<HashRouter><NodeCard node={node} /></HashRouter>)
    expect(container.querySelector('svg')).toBeTruthy()
    expect(screen.getByRole('link', { name: /Buscar ayuda/i })).toHaveAttribute('href', '#/chain/scene-help')
  })
})
