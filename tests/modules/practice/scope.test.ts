import { describe, it, expect } from 'vitest'

import { isCardInScope, inScopeCards, isTopicInScope, ENABLED_CONCEPTS } from '@/modules/practice/domain/scope'
import type { Card } from '@/shared/content/types'

const card = (id: string, topic: string, rationaleRef: string): Card =>
  ({ id, topic, type: 'escribir', prompt: 'p', answer: ['a'], rationaleRef }) as Card

describe('practice scope (temporary: Escena + Primaria + AVDN)', () => {
  it('ENABLED_CONCEPTS is exactly the scene/primary/avdn concepts', () => {
    expect([...ENABLED_CONCEPTS].sort()).toEqual(['avdn', 'escena', 'habcde', 'mdd', 'primaria', 'tev'])
  })

  it('isCardInScope: true for scene/primary/avdn concepts, false otherwise', () => {
    expect(isCardInScope(card('1', 'Escena', 'escena'))).toBe(true)
    expect(isCardInScope(card('2', 'HABCDE', 'habcde'))).toBe(true)
    expect(isCardInScope(card('3', 'AVDN', 'avdn'))).toBe(true)
    expect(isCardInScope(card('4', 'Mecanismo', 'mdd'))).toBe(true)
    expect(isCardInScope(card('5', 'Signos vitales', 'signos_vitales'))).toBe(false)
    expect(isCardInScope(card('6', 'Evacuación', 'niveles_evacuacion'))).toBe(false)
  })

  it('inScopeCards drops out-of-scope cards', () => {
    const cards = [card('a', 'HABCDE', 'habcde'), card('b', 'Signos vitales', 'signos_vitales')]
    expect(inScopeCards(cards).map(c => c.id)).toEqual(['a'])
  })

  it('isTopicInScope: true if the topic has any in-scope card (incl. a mixed topic)', () => {
    const cards = [
      card('m1', 'Manejo', 'habcde'),
      card('m2', 'Manejo', 'secundaria'),
      card('s1', 'Signos vitales', 'signos_vitales'),
    ]
    expect(isTopicInScope(cards, 'Manejo')).toBe(true)
    expect(isTopicInScope(cards, 'Signos vitales')).toBe(false)
  })
})
