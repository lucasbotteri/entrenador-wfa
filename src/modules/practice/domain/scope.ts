import type { Card } from '@/shared/content/types'

// TEMPORARY: Practicar is limited to what class has covered — Escena + Primaria + AVDN.
// Widen or delete this set as the course advances. Keyed by Card.rationaleRef (concept id).
export const ENABLED_CONCEPTS: ReadonlySet<string> = new Set([
  'escena', 'mdd', 'tev', // Evaluación de la escena (4 partes, incl. bioseguridad/EPP → 'escena')
  'habcde', 'primaria', // Evaluación primaria
  'avdn', // AVDN (explicit keep)
])

export function isCardInScope(card: Card): boolean {
  return ENABLED_CONCEPTS.has(card.rationaleRef)
}

export function inScopeCards(cards: Card[]): Card[] {
  return cards.filter(isCardInScope)
}

export function isTopicInScope(cards: Card[], topic: string): boolean {
  return cards.some(c => c.topic === topic && isCardInScope(c))
}
