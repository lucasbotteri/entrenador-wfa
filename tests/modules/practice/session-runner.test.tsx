import 'fake-indexeddb/auto'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { it, expect, vi } from 'vitest'

import { SessionRunner } from '@/modules/practice/ui/SessionRunner'
import type { Card } from '@/shared/content/types'
import { __resetStorage } from '@/shared/domain/storage'

const cards: Card[] = [
  { id: 't-w', topic: 'HABCDE', type: 'escribir', prompt: '¿H?', answer: ['hemorragia'], rationaleRef: 'habcde' } as Card,
]

it('grades an answer, shows feedback, and finishes', async () => {
  __resetStorage()
  const onDone = vi.fn()
  const map = new Map([['habcde', 'Lo que mata primero, primero.']])
  render(
    <MemoryRouter>
      <SessionRunner queue={cards} rationaleMap={map} today="2026-06-19" onDone={onDone} />
    </MemoryRouter>,
  )
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'hemorragia' } })
  fireEvent.click(screen.getByRole('button', { name: /Comprobar/i }))
  expect(await screen.findByText(/¡Bien!/i)).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: /Continuar/i }))
  await waitFor(() => expect(onDone).toHaveBeenCalled())
  expect(onDone.mock.calls[0]?.[0]).toMatchObject({ correct: 1, wrong: 0, total: 1 })
})
