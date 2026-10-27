import { useEffect, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'

import styles from './Shell.module.css'
import { useOnlineStatus } from './pwa'

import { useDueCount } from '@/modules/practice/content/useDueCount'

const TABS: Array<{ to: string; label: string; match: (p: string) => boolean }> = [
  { to: '/', label: 'Aprender', match: p => p === '/' || p.startsWith('/chain') || p === '/example' || p === '/quickref' },
  { to: '/practice', label: 'Practicar', match: p => p.startsWith('/practice') },
  { to: '/scenarios', label: 'Escenarios', match: p => p.startsWith('/scenarios') },
]

export function Shell({ children }: { children: ReactNode }) {
  const online = useOnlineStatus()
  const { pathname, hash } = useLocation()
  const due = useDueCount()

  // New route → start at the top (in-page anchors handle their own scrolling).
  useEffect(() => {
    if (hash) return
    try {
      window.scrollTo({ top: 0 })
    } catch {
      /* not supported (e.g. jsdom) */
    }
  }, [pathname, hash])

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
            {t.to === '/practice' && due > 0 && <span className={styles.badge}>{due}</span>}
          </Link>
        ))}
      </nav>
    </>
  )
}
