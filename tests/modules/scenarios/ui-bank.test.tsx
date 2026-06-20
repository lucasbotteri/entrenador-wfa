import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import { ActionBank } from '@/modules/scenarios/ui/ActionBank'
import { DidTrail } from '@/modules/scenarios/ui/DidTrail'
import { DistractorFeedback } from '@/modules/scenarios/ui/DistractorFeedback'

describe('scenarios bank ui', () => {
  it('ActionBank renders actions and calls onAct on tap', () => {
    const onAct = vi.fn()
    render(<ActionBank actions={[{ id: 'H', text: 'Control hemorragia' }, { id: 'agua', text: 'Darle agua' }]} onAct={onAct} />)
    fireEvent.click(screen.getByRole('button', { name: /Darle agua/i }))
    expect(onAct).toHaveBeenCalledWith('agua')
  })
  it('DistractorFeedback shows type + whyNot', () => {
    render(<DistractorFeedback type="tecnica" whyNot="Hiperextiende el cuello." />)
    expect(screen.getByText(/tecnica/i)).toBeInTheDocument()
    expect(screen.getByText(/Hiperextiende/)).toBeInTheDocument()
  })
  it('DidTrail renders done actions with correct/incorrect markers', () => {
    render(<DidTrail items={[{ id: 'H', text: 'Control hemorragia', ok: true }, { id: 'agua', text: 'Darle agua', ok: false }]} />)
    expect(screen.getByText('Control hemorragia')).toBeInTheDocument()
    expect(screen.getByText('Darle agua')).toBeInTheDocument()
  })
})
