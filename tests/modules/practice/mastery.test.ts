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

describe('masteryByTopic — scope flag (temporary)', () => {
  const card = (id: string, topic: string, rationaleRef: string): Card =>
    ({ id, topic, type: 'escribir', prompt: 'p', answer: ['a'], rationaleRef }) as Card

  it('marks topics enabled when they have an in-scope card, and sorts enabled first', () => {
    const cards = [
      card('s1', 'Signos vitales', 'signos_vitales'), // disabled
      card('h1', 'HABCDE', 'habcde'),                 // enabled
      card('m1', 'Manejo', 'habcde'),                 // enabled (mixed topic)
      card('m2', 'Manejo', 'secundaria'),
    ]
    const m = masteryByTopic(cards, {})
    expect(m.find(t => t.topic === 'HABCDE')!.enabled).toBe(true)
    expect(m.find(t => t.topic === 'Manejo')!.enabled).toBe(true)
    expect(m.find(t => t.topic === 'Signos vitales')!.enabled).toBe(false)
    const lastEnabled = m.findIndex(t => !t.enabled)
    expect(m.slice(0, lastEnabled).every(t => t.enabled)).toBe(true)
    expect(m.slice(lastEnabled).every(t => !t.enabled)).toBe(true)
  })
})
