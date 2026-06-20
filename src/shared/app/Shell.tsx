import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'

import styles from './Shell.module.css'
import { useOnlineStatus } from './pwa'

const TABS = [
  { to: '/', label: 'Aprender', match: (p: string) => p === '/' || p.startsWith('/chain') || p === '/example' || p === '/quickref' },
  { to: '/practice', label: 'Practicar', match: (p: string) => p.startsWith('/practice') },
] as const

export function Shell({ children }: { children: ReactNode }) {
  const online = useOnlineStatus()
  const { pathname } = useLocation()
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
        <span>Entrenador WFA</span>
      </header>
      <main id="main" className={styles.main}>
        {children}
      </main>
      <nav className={styles.tabs} aria-label="Módulos">
        {TABS.map(t => (
          <Link key={t.to} to={t.to} className={`${styles.tab} ${t.match(pathname) ? styles.tabOn : ''}`}>
            {t.label}
          </Link>
        ))}
        <span className={`${styles.tab} ${styles.tabDisabled}`} aria-disabled>
          Escenarios
        </span>
      </nav>
    </>
  )
}
