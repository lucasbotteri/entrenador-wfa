import { describe, it, expect } from 'vitest'

import { buildChainModel } from '@/modules/learn/domain/chainModel'
import { loadContent } from '@/shared/content/loader'
import { linkForRef } from '@/shared/domain/conceptLinks'

// A link may carry an in-page anchor (e.g. /quickref#criterios); routes are compared without it.
const path = (link: string) => link.split('#')[0] ?? link

describe('conceptLinks invariant (M2)', () => {
  it('every real card rationaleRef links to a resolvable route', () => {
    const content = loadContent()
    const nodeIds = new Set(
      buildChainModel(content)
        .flatMap(p => p.nodes)
        .map(n => n.id),
    )
    const staticRoutes = new Set(['/', '/quickref', '/example'])
    for (const card of content.cards) {
      const link = path(linkForRef(card.rationaleRef))
      const ok =
        staticRoutes.has(link) ||
        (link.startsWith('/chain/') && nodeIds.has(link.slice('/chain/'.length)))
      expect(ok, `card ${card.id} ref "${card.rationaleRef}" → ${link}`).toBe(true)
    }
  })

  it('every clinical topic and acronym resolves to a real route, not the "/" fallback', () => {
    const content = loadContent()
    const nodeIds = new Set(
      buildChainModel(content)
        .flatMap(p => p.nodes)
        .map(n => n.id),
    )
    const staticRoutes = new Set(['/quickref', '/example'])
    const refs = [...content.clinicalTopics.map(t => t.id), ...content.acronyms.map(a => a.id)]
    for (const ref of refs) {
      const link = path(linkForRef(ref))
      expect(link, `${ref} must map to a non-fallback route`).not.toBe('/')
      const ok =
        staticRoutes.has(link) ||
        (link.startsWith('/chain/') && nodeIds.has(link.slice('/chain/'.length)))
      expect(ok, `${ref} → ${link}`).toBe(true)
    }
  })
})
