import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'

import { Debrief } from '@/modules/scenarios/ui/Debrief'
import { EvacuationDecision } from '@/modules/scenarios/ui/EvacuationDecision'

describe('scenarios debrief ui', () => {
  it('EvacuationDecision calls onDecide with the chosen level', () => {
    const onDecide = vi.fn()
    render(<EvacuationDecision options={[{ level: 'CRÍTICO' }, { level: 'LEVE' }]} onDecide={onDecide} />)
    fireEvent.click(screen.getByRole('button', { name: 'CRÍTICO' }))
    expect(onDecide).toHaveBeenCalledWith('CRÍTICO')
  })
  it('Debrief renders the sections + links', () => {
    render(
      <MemoryRouter>
        <Debrief
          debrief={{
            summary: { criticalDone: 1, criticalTotal: 2, dangerous: 1, prioritiesOk: true },
            did: [{ text: 'Control hemorragia', concept: 'habcde', link: '/chain/primary-habcde-h' }],
            missed: [{ text: 'Vía aérea', concept: 'habcde', link: '/chain/primary-habcde-h' }],
            dangerous: [{ text: 'Darle agua', concept: 'habcde', link: '/chain/primary-habcde-h' }],
            priorities: { ok: true, text: 'Respetaste el orden.' },
            evacuation: { chosen: 'CRÍTICO', correct: 'CRÍTICO', ok: true, feedback: 'urgente' },
          }}
          onRetry={() => {}}
          onBack={() => {}}
        />
      </MemoryRouter>,
    )
    expect(screen.getByText(/Hiciste/i)).toBeInTheDocument()
    expect(screen.getByText('Control hemorragia')).toBeInTheDocument()
    expect(screen.getByText('Vía aérea')).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /Ver .* en Aprender/i })[0]).toHaveAttribute('href', '/chain/primary-habcde-h')
  })
})
