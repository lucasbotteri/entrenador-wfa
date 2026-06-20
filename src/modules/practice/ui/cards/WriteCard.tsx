import { useState } from 'react'

import { shellStyles } from '../CardShell'
import { SelfGradeCard } from '../SelfGradeCard'

import type { Card } from '@/shared/content/types'

export function WriteCard({ card, onResolve }: { card: Card; onResolve: (correct: boolean) => void }) {
  const [value, setValue] = useState('')
  return (
    <SelfGradeCard card={card} onResolve={onResolve}>
      <input
        className={shellStyles.input}
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Escribí tu respuesta…"
        aria-label="Respuesta"
      />
    </SelfGradeCard>
  )
}
