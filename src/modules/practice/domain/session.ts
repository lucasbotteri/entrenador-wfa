import type { CardState } from './srs'

import type { Card } from '@/shared/content/types'


interface Opts {
  cap?: number
  maxNew?: number
}

// Greedy interleave: repeatedly pick the next card whose topic differs from the
// previous one when possible, to avoid same-topic runs.
function interleave(cards: Card[]): Card[] {
  const out: Card[] = []
  const pool = [...cards]
  let prevTopic: string | undefined
  while (pool.length) {
    let idx = pool.findIndex(c => c.topic !== prevTopic)
    if (idx === -1) idx = 0
    const [picked] = pool.splice(idx, 1)
    out.push(picked!)
    prevTopic = picked!.topic
  }
  return out
}

export function buildSession(
  cards: Card[],
  states: Record<string, CardState>,
  today: string,
  opts: Opts = {},
): Card[] {
  const cap = opts.cap ?? 14
  const maxNew = opts.maxNew ?? 4
  const due: Card[] = []
  const fresh: Card[] = []
  for (const c of cards) {
    const st = states[c.id]
    if (!st) fresh.push(c)
    else if (st.due <= today) due.push(c)
  }
  due.sort((a, b) => (states[a.id]!.due < states[b.id]!.due ? -1 : 1))
  const picked = [...due, ...fresh.slice(0, maxNew)].slice(0, cap)
  return interleave(picked)
}
