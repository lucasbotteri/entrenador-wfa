import { useState, type ReactNode } from 'react'

import { CardShell, shellStyles } from './CardShell'

import { answerText } from '@/modules/practice/domain/grading'
import type { Card } from '@/shared/content/types'

// Self-graded card (escribir/cloze): the learner writes (optional aid), reveals the
// expected answer, then judges their own recall. The judgment is the SRS signal —
// the typed text is never compared.
export function SelfGradeCard({
  card,
  children,
  onResolve,
}: {
  card: Card
  children: ReactNode
  onResolve: (correct: boolean) => void
}) {
  const [revealed, setRevealed] = useState(false)

  const footer = revealed ? (
    <div className={shellStyles.reveal}>
      <p className={shellStyles.answerLabel}>Respuesta</p>
      <p className={shellStyles.answer}>{answerText(card)}</p>
      <p className={shellStyles.judgeAsk}>¿Te acordaste?</p>
      <div className={shellStyles.judgeRow}>
        <button className={shellStyles.judgeNo} onClick={() => onResolve(false)}>
          No me acordé
        </button>
        <button className={shellStyles.judgeYes} onClick={() => onResolve(true)}>
          Me acordé
        </button>
      </div>
    </div>
  ) : (
    <button className={shellStyles.submit} onClick={() => setRevealed(true)}>
      Mostrar respuesta
    </button>
  )

  return (
    <CardShell card={card} footer={footer}>
      {children}
    </CardShell>
  )
}
