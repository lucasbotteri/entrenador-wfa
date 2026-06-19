import type { ReactNode } from 'react'

import styles from './Shell.module.css'
import { useOnlineStatus } from './pwa'

export function Shell({ children }: { children: ReactNode }) {
  const online = useOnlineStatus()
  return (
    <>
      <a className="skip-link" href="#main">
        Saltar al contenido
      </a>
      <header className={styles.header}>
        <span>
          <span className={`${styles.dot} ${online ? styles.online : styles.offline}`} />
          {online ? 'En línea' : 'Offline-ready'}
        </span>
        <span>Aprender · Módulo 1</span>
      </header>
      <main id="main" className={styles.main}>
        {children}
      </main>
    </>
  )
}
