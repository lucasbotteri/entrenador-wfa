import styles from './LetterBadge.module.css'

export function LetterBadge({ letter, size = 'md' }: { letter: string; size?: 'md' | 'lg' }) {
  return (
    <span className={`${styles.badge} ${styles[size]}`} aria-label={`Letra ${letter}`}>
      {letter}
    </span>
  )
}
