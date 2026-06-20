import { describe, it, expect } from 'vitest'

import { fixtureCase } from '../../fixtures/scenarios.fixture'

import { getCase, allCases } from '@/modules/scenarios/content/selectors'

describe('scenarios selectors', () => {
  it('getCase finds by id; allCases lists', () => {
    const cases = [fixtureCase]
    expect(getCase(cases, 'demo')?.title).toBe('Demo')
    expect(getCase(cases, 'nope')).toBeNull()
    expect(allCases(cases)).toHaveLength(1)
  })
})
