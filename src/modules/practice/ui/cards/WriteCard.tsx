import { useState } from 'react'

import { CardShell, shellStyles } from '../CardShell'

import type { Card } from '@/shared/content/types'

export function WriteCard({ card, onAnswer }: { card: Card; onAnswer: (a: string) => void }) {
  const [value, setValue] = useState('')
  return (
    <CardShell card={card} onSubmit={() => onAnswer(value)}>
      <input
        className={shellStyles.input}
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Escribí tu respuesta…"
        aria-label="Respuesta"
      />
    </CardShell>
  )
}
