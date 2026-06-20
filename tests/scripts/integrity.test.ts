/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest'

import { collectConceptIds, findDuplicateIds, findDanglingRefs } from '../../scripts/integrity'

const base = {
  acronyms: [{ id: 'habcde', concept: 'primaria', rationale: 'r' }],
  chain: [{ phase: 'primary', rationale: 'r', content: {} }],
  clinicalTopics: [{ id: 'shock', name: 'Shock', rationale: 'r' }],
  practicalRules: [{ id: 'hemorragia', rule: 'r', concept: 'habcde' }],
  workedExample: {
    title: 't',
    steps: [{ phase: 'primary', state: 's', action: 'a', rationaleRef: 'shock' }],
  },
  cards: [{ id: 'c1', rationaleRef: 'habcde' }],
} as any

describe('integrity', () => {
  it('collects all concept ids', () => {
    expect(collectConceptIds(base)).toEqual(
      expect.arrayContaining(['habcde', 'shock', 'primary']),
    )
  })

  it('detects duplicate ids across sources', () => {
    const dup = { ...base, clinicalTopics: [{ id: 'habcde', name: 'x', rationale: 'r' }] }
    expect(findDuplicateIds(dup)).toContain('habcde')
  })

  it('detects dangling rationaleRef', () => {
    const bad = {
      ...base,
      workedExample: {
        title: 't',
        steps: [{ phase: 'primary', state: 's', action: 'a', rationaleRef: 'ghost' }],
      },
    }
    expect(findDanglingRefs(bad)).toContain('ghost')
  })

  it('passes a clean content set', () => {
    expect(findDuplicateIds(base)).toEqual([])
    expect(findDanglingRefs(base)).toEqual([])
  })

  it('validates card rationaleRef in M2 (dangling card ref → finding)', () => {
    const withBadCard = { ...base, cards: [{ id: 'c1', rationaleRef: 'does-not-exist' }] }
    expect(findDanglingRefs(withBadCard)).toContain('does-not-exist')
  })

  it('accepts Spanish phase aliases as known ids', () => {
    const withAliasCard = { ...base, cards: [{ id: 'c2', rationaleRef: 'primaria' }] }
    expect(findDanglingRefs(withAliasCard)).toEqual([])
  })
})
