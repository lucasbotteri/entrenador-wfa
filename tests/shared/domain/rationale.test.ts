import { describe, it, expect } from 'vitest'

import { validContent } from '../../fixtures/content.fixture'

import { buildRationaleMap, getRationale } from '@/shared/domain/rationale'


describe('rationale map', () => {
  it('indexes rationale by concept id from every source', () => {
    const m = buildRationaleMap(validContent)
    expect(getRationale('habcde', m)).toContain('mata primero')
    expect(getRationale('shock', m)).toContain('Hipoperfusión')
    expect(getRationale('scene', m)).toBeDefined()        // chain phase id resolves
    expect(getRationale('primaria', m)).toBeDefined()     // Spanish phase alias resolves (M2)
  })

  it('returns undefined for an unknown concept', () => {
    const m = buildRationaleMap(validContent)
    expect(getRationale('ghost', m)).toBeUndefined()
  })

  it('resolves Spanish phase aliases (M2 card refs)', () => {
    const m = buildRationaleMap(validContent)
    expect(getRationale('escena', m)).toBeDefined()
    expect(getRationale('primaria', m)).toBeDefined()
    expect(getRationale('secundaria', m)).toBeDefined()
  })

  it('every fixture card ref resolves', () => {
    const m = buildRationaleMap(validContent)
    for (const card of validContent.cards) expect(getRationale(card.rationaleRef, m)).toBeDefined()
  })
})
