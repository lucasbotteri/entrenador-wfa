import { useState } from 'react'

import { CardShell, shellStyles } from '../CardShell'

import type { Card } from '@/shared/content/types'

// Deterministic initial order: reverse of answer (so it always differs and tests are stable).
function initialOrder(answer: string[]): string[] {
  return [...answer].reverse()
}

export function OrderCard({ card, onAnswer }: { card: Card; onAnswer: (a: string[]) => void }) {
  const [items, setItems] = useState<string[]>(() => initialOrder(card.answer))
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= items.length) return
    const next = [...items]
    ;[next[i], next[j]] = [next[j]!, next[i]!]
    setItems(next)
  }
  return (
    <CardShell card={card} onSubmit={() => onAnswer(items)}>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {items.map((it, i) => (
          <li key={it} className={shellStyles.option} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ flex: 1 }}>{it}</span>
            <button aria-label={`Subir ${it}`} onClick={() => move(i, -1)} disabled={i === 0}>↑</button>
            <button aria-label={`Bajar ${it}`} onClick={() => move(i, 1)} disabled={i === items.length - 1}>↓</button>
          </li>
        ))}
      </ul>
    </CardShell>
  )
}
