import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'

import type { ChainPhase } from '@/modules/learn/domain/chainModel'
import { PhaseTimeline } from '@/modules/learn/ui/PhaseTimeline'

const phase: ChainPhase = { id: 'scene', title: 'Escena', rationale: 'r', nodes: [] }

describe('PhaseTimeline (P2)', () => {
  it('numbers phases from 1 as "Eslabón N", not 0-based "Fase"', () => {
    render(
      <MemoryRouter>
        <PhaseTimeline phase={phase} index={0} />
      </MemoryRouter>,
    )
    expect(screen.getByText('Eslabón 1')).toBeInTheDocument()
    expect(screen.queryByText('Fase 0')).not.toBeInTheDocument()
  })
})
