import { describe, it, expect } from 'vitest'

import { validContent } from '../../fixtures/content.fixture'

import { buildRationaleMap, getRationale } from '@/shared/domain/rationale'


describe('rationale map', () => {
  it('indexes rationale by concept id from every source', () => {
    const m = buildRationaleMap(validContent)
    expect(getRationale('habcde', m)).toContain('mata primero')
    expect(getRationale('shock', m)).toContain('Hipoperfusión')
    expect(getRationale('scene', m)).toBeDefined()        // chain phase id resolves
    expect(getRationale('primaria', m)).toBeUndefined()   // acronym.concept is NOT a key
  })

  it('returns undefined for an unknown concept', () => {
    const m = buildRationaleMap(validContent)
    expect(getRationale('ghost', m)).toBeUndefined()
  })
})
