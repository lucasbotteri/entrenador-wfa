import type { Content } from '@/shared/content/types'

export function buildRationaleMap(content: Content): Map<string, string> {
  const m = new Map<string, string>()
  for (const a of content.acronyms) m.set(a.id, a.rationale)
  for (const phase of content.chain) m.set(phase.phase, phase.rationale)
  for (const t of content.clinicalTopics) m.set(t.id, t.rationale)
  return m
}

export function getRationale(conceptId: string, map: Map<string, string>): string | undefined {
  return map.get(conceptId)
}
