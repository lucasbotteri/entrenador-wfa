import 'fake-indexeddb/auto'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { it, expect, vi } from 'vitest'

import { validContent } from '../../fixtures/content.fixture'

vi.mock('@/shared/content/loader', () => ({ loadContent: () => validContent }))

import { PracticeHome } from '@/modules/practice/routes/PracticeHome'
import { __resetStorage } from '@/shared/domain/storage'

it('shows due count and mastery, links to a session', async () => {
  __resetStorage()
  render(<MemoryRouter><PracticeHome /></MemoryRouter>)
  expect(await screen.findByText(/Repaso de hoy/i)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /Empezar sesión/i })).toHaveAttribute('href', '/practice/session')
  await waitFor(() => expect(screen.getByText(/HABCDE/)).toBeInTheDocument())
})
