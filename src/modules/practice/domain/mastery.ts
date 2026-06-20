import { isCardInScope } from './scope'
import type { CardState } from './srs'

import type { Card } from '@/shared/content/types'

export interface TopicMastery {
  topic: string
  pct: number
  count: number
  enabled: boolean
}

export function masteryByTopic(cards: Card[], states: Record<string, CardState>): TopicMastery[] {
  const byTopic = new Map<string, { total: number; mastered: number; enabled: boolean }>()
  for (const c of cards) {
    const t = byTopic.get(c.topic) ?? { total: 0, mastered: 0, enabled: false }
    t.total += 1
    if ((states[c.id]?.box ?? 1) >= 4) t.mastered += 1
    if (isCardInScope(c)) t.enabled = true
    byTopic.set(c.topic, t)
  }
  const rows = [...byTopic.entries()].map(([topic, { total, mastered, enabled }]) => ({
    topic,
    count: total,
    pct: total ? Math.round((mastered / total) * 100) : 0,
    enabled,
  }))
  // Enabled topics first; Array.prototype.sort is stable, so within each group the
  // original first-occurrence order is preserved.
  return rows.sort((a, b) => Number(b.enabled) - Number(a.enabled))
}
