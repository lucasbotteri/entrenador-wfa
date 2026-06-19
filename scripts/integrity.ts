/* eslint-disable @typescript-eslint/no-explicit-any */

// Every source that produces a concept id used as a rationale key (spec §4.4).
export function collectConceptIds(c: any): string[] {
  const ids: string[] = []
  for (const a of c.acronyms ?? []) ids.push(a.id, a.concept)
  for (const t of c.clinicalTopics ?? []) ids.push(t.id)
  for (const r of c.practicalRules ?? []) ids.push(r.id)
  return ids.filter((v, i, arr) => arr.indexOf(v) === i)
}

// A concept id must be produced by exactly one source row. Duplicate id rows
// would silently overwrite a rationale-map entry.
export function findDuplicateIds(c: any): string[] {
  const counts = new Map<string, number>()
  const bump = (id: string) => counts.set(id, (counts.get(id) ?? 0) + 1)
  for (const a of c.acronyms ?? []) bump(a.id)
  for (const t of c.clinicalTopics ?? []) bump(t.id)
  for (const r of c.practicalRules ?? []) bump(r.id)
  return [...counts.entries()].filter(([, n]) => n > 1).map(([id]) => id)
}

export function findDanglingRefs(c: any): string[] {
  const known = new Set(collectConceptIds(c))
  const dangling: string[] = []
  const check = (ref?: string) => {
    if (ref && !known.has(ref)) dangling.push(ref)
  }
  for (const s of c.workedExample?.steps ?? []) check(s.rationaleRef)
  for (const card of c.cards ?? []) check(card.rationaleRef)
  return dangling.filter((v, i, arr) => arr.indexOf(v) === i)
}
