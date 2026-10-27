import type { Content } from '@/shared/content/types'

// Cards (Module 2) reference phases by their Spanish names; the map keys phases
// by English id. Register the Spanish alias → same rationale so card refs resolve.
const PHASE_ALIAS: Record<string, string> = {
  scene: 'escena',
  primary: 'primaria',
  secondary: 'secundaria',
  evacuation: 'evacuacion',
}

export function buildRationaleMap(content: Content): Map<string, string> {
  const m = new Map<string, string>()
  for (const a of content.acronyms) m.set(a.id, a.rationale)
  for (const phase of content.chain) {
    m.set(phase.phase, phase.rationale)
    const alias = PHASE_ALIAS[phase.phase]
    if (alias) m.set(alias, phase.rationale)
  }
  for (const t of content.clinicalTopics) m.set(t.id, t.rationale)
  return m
}

export function getRationale(conceptId: string, map: Map<string, string>): string | undefined {
  return map.get(conceptId)
}

// Human-readable name per concept id, for feedback links ("Ver … en Aprender").
export function buildConceptNameMap(content: Content): Map<string, string> {
  const m = new Map<string, string>()
  for (const a of content.acronyms) m.set(a.id, `${a.acronym} · ${a.name}`)
  for (const phase of content.chain) {
    m.set(phase.phase, phase.name)
    const alias = PHASE_ALIAS[phase.phase]
    if (alias) m.set(alias, phase.name)
  }
  for (const t of content.clinicalTopics) m.set(t.id, t.name)
  return m
}

export function getConceptName(conceptId: string, map: Map<string, string>): string {
  return map.get(conceptId) ?? conceptId
}
