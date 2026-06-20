import { describe, it, expect } from 'vitest'

import { buildSession } from '@/modules/practice/domain/session'
import type { Card } from '@/shared/content/types'

const card = (id: string, topic: string): Card =>
  ({ id, topic, type: 'escribir', prompt: 'p', answer: ['a'], rationaleRef: 'habcde' }) as Card

describe('buildSession', () => {
  const cards = [card('a', 'X'), card('b', 'X'), card('c', 'Y'), card('d', 'Y'), card('e', 'Z')]
  it('includes due cards (no state = due) capped', () => {
    const s = buildSession(cards, {}, '2026-06-19', { cap: 3, maxNew: 3 })
    expect(s.length).toBe(3)
  })
  it('avoids adjacent same-topic when possible', () => {
    const s = buildSession(cards, {}, '2026-06-19', { cap: 5, maxNew: 5 })
    let adjacent = 0
    for (let i = 1; i < s.length; i++) if (s[i]!.topic === s[i - 1]!.topic) adjacent++
    expect(adjacent).toBe(0)
  })
  it('excludes cards not yet due', () => {
    const states = { a: { box: 3, due: '2026-07-01' } }
    const s = buildSession(cards, states, '2026-06-19', { cap: 10, maxNew: 10 })
    expect(s.find(c => c.id === 'a')).toBeUndefined()
  })
})
