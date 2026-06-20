import { describe, it, expect } from 'vitest'

import { validContent } from '../../fixtures/content.fixture'

import { getNodeById, getAllNodes } from '@/modules/learn/content/selectors'
import { buildChainModel } from '@/modules/learn/domain/chainModel'

const model = buildChainModel(validContent)

describe('selectors', () => {
  it('flattens all nodes across phases', () => {
    expect(getAllNodes(model).length).toBeGreaterThanOrEqual(3)
  })
  it('finds a node by id', () => {
    expect(getNodeById(model, 'primary-habcde-h')?.letter).toBe('H')
    expect(getNodeById(model, 'nope')).toBeNull()
  })
})
