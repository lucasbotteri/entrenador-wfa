import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import type { TopicMastery } from '@/modules/practice/domain/mastery'
import { MasteryBars } from '@/modules/practice/ui/MasteryBars'

const items: TopicMastery[] = [
  { topic: 'HABCDE', pct: 80, count: 6, enabled: true },
  { topic: 'Signos vitales', pct: 0, count: 5, enabled: false },
]

describe('MasteryBars (scope)', () => {
  it('shows % for an enabled topic and the "Aún no visto en clase" tag (no %) for a disabled one', () => {
    render(<MasteryBars items={items} />)
    expect(screen.getByText('80%')).toBeInTheDocument()
    expect(screen.getByText('Signos vitales')).toBeInTheDocument()
    expect(screen.getByText(/Aún no visto en clase/i)).toBeInTheDocument()
    expect(screen.queryByText('0%')).not.toBeInTheDocument()
  })
})
