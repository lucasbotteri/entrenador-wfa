import { describe, it, expect } from 'vitest'

import { validContent } from '../../fixtures/content.fixture'

import { getDueCards } from '@/modules/practice/content/selectors'
import { inScopeCards } from '@/modules/practice/domain/scope'
import { buildSession } from '@/modules/practice/domain/session'

// Fixture cards: t-w/t-o (HABCDE→habcde, in scope), t-c (AVDN→avdn, in scope),
// t-e (Manejo→secundaria, OUT of scope).
describe('scope wiring: out-of-scope cards are excluded from due + session', () => {
  it('getDueCards over inScopeCards drops the secundaria card', () => {
    const due = getDueCards(inScopeCards(validContent.cards), {}, '2026-06-20')
    expect(due.find(c => c.id === 't-e')).toBeUndefined()
    expect(due.find(c => c.id === 't-w')).toBeDefined()
  })

  it('buildSession over inScopeCards drops the secundaria card', () => {
    const queue = buildSession(inScopeCards(validContent.cards), {}, '2026-06-20', { cap: 10, maxNew: 10 })
    expect(queue.find(c => c.id === 't-e')).toBeUndefined()
  })
})
