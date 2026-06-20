import type { CardState } from './srs'

import type { Card } from '@/shared/content/types'


export interface TopicMastery {
  topic: string
  pct: number
  count: number
}

export function masteryByTopic(cards: Card[], states: Record<string, CardState>): TopicMastery[] {
  const byTopic = new Map<string, { total: number; mastered: number }>()
  for (const c of cards) {
    const t = byTopic.get(c.topic) ?? { total: 0, mastered: 0 }
    t.total += 1
    if ((states[c.id]?.box ?? 1) >= 4) t.mastered += 1
    byTopic.set(c.topic, t)
  }
  return [...byTopic.entries()].map(([topic, { total, mastered }]) => ({
    topic,
    count: total,
    pct: total ? Math.round((mastered / total) * 100) : 0,
  }))
}
