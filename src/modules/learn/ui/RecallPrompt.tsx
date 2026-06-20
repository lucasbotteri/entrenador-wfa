import { useState, type ReactNode } from 'react'

import styles from './RecallPrompt.module.css'

// Ephemeral tap-to-reveal (P5). Hides `children` behind a recall prompt; tapping
// reveals them. State is local and not persisted — to re-hide on a new node,
// give the element a `key` (e.g. the nodeId) so React remounts it.
export function RecallPrompt({ question, children }: { question: string; children: ReactNode }) {
  const [revealed, setRevealed] = useState(false)
  if (revealed) return <>{children}</>
  return (
    <button
      type="button"
      className={styles.button}
      aria-label={`Revelar: ${question}`}
      onClick={() => setRevealed(true)}
    >
      <span className={styles.question}>{question}</span>
      <span className={styles.hint}>Pensalo… después tocá para revelar</span>
    </button>
  )
}
