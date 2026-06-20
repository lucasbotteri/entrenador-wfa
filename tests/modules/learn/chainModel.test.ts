import { describe, it, expect } from 'vitest'

import { validContent } from '../../fixtures/content.fixture'

import { buildChainModel } from '@/modules/learn/domain/chainModel'


describe('buildChainModel', () => {
  const model = buildChainModel(validContent)

  it('produces the four phases in order', () => {
    expect(model.map(p => p.id)).toEqual(['scene', 'primary', 'secondary', 'evacuation'])
  })

  it('expands HABCDE into one node per letter', () => {
    const primary = model.find(p => p.id === 'primary')!
    expect(primary.nodes.map(n => n.letter)).toEqual(['H', 'A'])
    expect(primary.nodes[0]?.id).toBe('primary-habcde-h')
  })

  it('each letter node carries meaning/detail and a resolvable rationale', () => {
    const h = model.find(p => p.id === 'primary')!.nodes[0]!
    expect(h.title).toBe('Hemorragia')
    expect(h.items[0]?.detail).toContain('Detener')
    expect(h.rationaleId).toBe('habcde')
  })

  it('builds a single evacuation decision node referencing evac levels', () => {
    const evac = model.find(p => p.id === 'evacuation')!
    expect(evac.nodes).toHaveLength(1)
    expect(evac.nodes[0]?.kind).toBe('reference')
  })
})
