import { describe, it, expect } from 'vitest'

import { findElegirWithoutOptions } from '../../scripts/integrity'

describe('elegir options guard', () => {
  it('flags an elegir card without options', () => {
    const c = { cards: [{ id: 'c', type: 'elegir', options: [] }, { id: 'd', type: 'escribir' }] }
    expect(findElegirWithoutOptions(c)).toEqual(['c'])
  })
  it('passes when elegir cards have options', () => {
    const c = { cards: [{ id: 'c', type: 'elegir', options: ['a', 'b'] }] }
    expect(findElegirWithoutOptions(c)).toEqual([])
  })
})
