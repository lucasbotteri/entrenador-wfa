import type { CardState } from '@/modules/practice/domain/srs'
import type { Card } from '@/shared/content/types'

export function getDueCards(cards: Card[], states: Record<string, CardState>, today: string): Card[] {
  return cards.filter(c => {
    const st = states[c.id]
    return !st || st.due <= today
  })
}

export function getTopics(cards: Card[]): string[] {
  return [...new Set(cards.map(c => c.topic))]
}
