import { describe, it, expect } from 'vitest'

import { buildChainModel } from '@/modules/learn/domain/chainModel'
import { linkForRef } from '@/modules/practice/domain/conceptLinks'
import { loadContent } from '@/shared/content/loader'

describe('conceptLinks invariant (M2)', () => {
  it('every real card rationaleRef links to a resolvable route', () => {
    const content = loadContent()
    const nodeIds = new Set(buildChainModel(content).flatMap(p => p.nodes).map(n => n.id))
    const staticRoutes = new Set(['/', '/quickref', '/example'])
    for (const card of content.cards) {
      const link = linkForRef(card.rationaleRef)
      const ok = staticRoutes.has(link) || (link.startsWith('/chain/') && nodeIds.has(link.slice('/chain/'.length)))
      expect(ok, `card ${card.id} ref "${card.rationaleRef}" → ${link}`).toBe(true)
    }
  })
})
