import type { ReactNode } from 'react'

import styles from './CardShell.module.css'

import type { Card } from '@/shared/content/types'

const TYPE_LABEL: Record<Card['type'], string> = {
  ordenar: 'Ordenar', escribir: 'Escribir', cloze: 'Cloze', elegir: 'Elegir',
}

export function CardShell({ card, children, onSubmit }: { card: Card; children: ReactNode; onSubmit: () => void }) {
  return (
    <div className={styles.card}>
      <div className={styles.meta}>
        <span>{card.topic}</span>
        <span className={styles.type}>{TYPE_LABEL[card.type]}</span>
      </div>
      <p className={styles.prompt}>{card.prompt}</p>
      {children}
      <button className={styles.submit} onClick={onSubmit}>Comprobar</button>
    </div>
  )
}

export { styles as shellStyles }
