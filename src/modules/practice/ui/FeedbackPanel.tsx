import { Link } from 'react-router-dom'

import styles from './FeedbackPanel.module.css'

import { linkForRef } from '@/shared/domain/conceptLinks'

export function FeedbackPanel({
  correct, correctText, rationale, rationaleRef, fromBox, toBox, onContinue,
}: {
  correct: boolean
  correctText: string
  rationale?: string
  rationaleRef: string
  fromBox: number
  toBox: number
  onContinue: () => void
}) {
  return (
    <div>
      <div className={`${styles.banner} ${correct ? styles.ok : styles.bad}`}>
        {correct ? '✓ ¡Bien!' : '✗ Revisalo'}
      </div>
      <div className={styles.body}>
        {!correct && (
          <p>
            <span className={styles.label}>Correcta</span>
            <br />
            {correctText}
          </p>
        )}
        {rationale && (
          <div className={styles.why}>
            <span className={styles.label}>Por qué</span>
            <p style={{ fontFamily: 'var(--font-serif)', margin: '4px 0 0' }}>{rationale}</p>
          </div>
        )}
        <Link to={linkForRef(rationaleRef)} style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13 }}>
          Ver "{rationaleRef}" en Aprender →
        </Link>
        <p className={styles.box}>Caja {fromBox} → {toBox}</p>
        <button className={styles.continue} onClick={onContinue}>Continuar</button>
      </div>
    </div>
  )
}
