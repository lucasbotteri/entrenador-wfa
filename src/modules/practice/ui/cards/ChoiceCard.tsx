import { useState } from 'react'

import { CardShell, shellStyles } from '../CardShell'

import type { Card } from '@/shared/content/types'

export function ChoiceCard({ card, onAnswer }: { card: Card; onAnswer: (a: string) => void }) {
  const [sel, setSel] = useState<string | null>(null)
  return (
    <CardShell card={card} onSubmit={() => sel != null && onAnswer(sel)}>
      {(card.options ?? []).map(opt => (
        <button
          key={opt}
          className={`${shellStyles.option} ${sel === opt ? shellStyles.sel : ''}`}
          onClick={() => setSel(opt)}
        >
          {opt}
        </button>
      ))}
    </CardShell>
  )
}
