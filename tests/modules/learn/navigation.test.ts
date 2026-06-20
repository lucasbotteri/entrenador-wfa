import { describe, it, expect } from 'vitest'

import { validContent } from '../../fixtures/content.fixture'

import { buildChainModel } from '@/modules/learn/domain/chainModel'
import { findPrevNext } from '@/modules/learn/domain/navigation'

const model = buildChainModel(validContent)

describe('findPrevNext', () => {
  it('returns no prev for the first node', () => {
    const first = buildChainModel(validContent)[0]!.nodes[0]!
    const { prev } = findPrevNext(model, first.id)
    expect(prev).toBeUndefined()
  })
  it('links H → A inside primary', () => {
    const { next } = findPrevNext(model, 'primary-habcde-h')
    expect(next?.id).toBe('primary-habcde-a')
  })
})
