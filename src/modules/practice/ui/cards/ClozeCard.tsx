import { useState, Fragment } from 'react'

import { CardShell, shellStyles } from '../CardShell'

import { parseCloze } from '@/modules/practice/domain/cloze'
import type { Card } from '@/shared/content/types'

export function ClozeCard({ card, onAnswer }: { card: Card; onAnswer: (a: string[]) => void }) {
  const { segments, blanks } = parseCloze(card.prompt)
  const [values, setValues] = useState<string[]>(() => Array(blanks).fill(''))
  const set = (i: number, v: string) => setValues(prev => prev.map((x, k) => (k === i ? v : x)))
  return (
    <CardShell card={card} onSubmit={() => onAnswer(values)}>
      <p style={{ fontFamily: 'var(--font-serif)', fontSize: 16, lineHeight: 2 }}>
        {segments.map((seg, i) => (
          <Fragment key={i}>
            {seg}
            {i < blanks && (
              <input
                className={shellStyles.input}
                style={{ display: 'inline-block', width: 110, padding: '4px 8px', margin: '0 4px' }}
                value={values[i]}
                onChange={e => set(i, e.target.value)}
                aria-label={`Hueco ${i + 1}`}
              />
            )}
          </Fragment>
        ))}
      </p>
    </CardShell>
  )
}
