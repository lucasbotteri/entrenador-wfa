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
