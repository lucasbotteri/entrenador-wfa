import 'fake-indexeddb/auto'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'

import { fixtureCase } from '../../fixtures/scenarios.fixture'

vi.mock('@/shared/content/loader', () => ({ loadCases: () => [fixtureCase], loadContent: () => ({ acronyms: [], chain: [], clinicalTopics: [] }) }))

import { Play } from '@/modules/scenarios/routes/Play'
import { __resetStorage } from '@/shared/domain/storage'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes><Route path="/scenarios/:caseId" element={<Play />} /></Routes>
    </MemoryRouter>,
  )
}

describe('Play', () => {
  it('runs a phase: tap a key action, advance, decide, see debrief', async () => {
    __resetStorage()
    renderAt('/scenarios/demo')
    // primary phase: do both criticals
    fireEvent.click(await screen.findByRole('button', { name: /Control de hemorragia/i }))
    fireEvent.click(screen.getByRole('button', { name: /Vía aérea con control cervical/i }))
    // continue to evacuation
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }))
    // decide
    fireEvent.click(await screen.findByRole('button', { name: 'CRÍTICO' }))
    // debrief
    expect(await screen.findByText(/Debrief/i)).toBeInTheDocument()
    expect(screen.getByText(/decisiones críticas 2\/2/)).toBeInTheDocument()
  })
})
