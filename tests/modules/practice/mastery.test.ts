import { describe, it, expect } from 'vitest'

import { masteryByTopic } from '@/modules/practice/domain/mastery'
import type { Card } from '@/shared/content/types'

const card = (id: string, topic: string): Card =>
  ({ id, topic, type: 'escribir', prompt: 'p', answer: ['a'], rationaleRef: 'habcde' }) as Card

describe('masteryByTopic', () => {
  it('pct = cards in box>=4 over topic total', () => {
    const cards = [card('a', 'X'), card('b', 'X'), card('c', 'Y')]
    const states = { a: { box: 4, due: '' }, b: { box: 2, due: '' } }
    const m = masteryByTopic(cards, states)
    const x = m.find(t => t.topic === 'X')!
    expect(x.pct).toBe(50)
    expect(x.count).toBe(2)
    const y = m.find(t => t.topic === 'Y')!
    expect(y.pct).toBe(0)
  })
})
