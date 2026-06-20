import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { getDueCards } from '@/modules/practice/content/selectors'
import { todayIso } from '@/modules/practice/domain/dates'
import { loadStates } from '@/modules/practice/domain/store'
import { loadContent } from '@/shared/content/loader'

// Reactive count of due cards. Recomputes on route change so it refreshes after a session.
export function useDueCount(): number {
  const [n, setN] = useState(0)
  const { pathname } = useLocation()
  useEffect(() => {
    let active = true
    const content = loadContent()
    const today = todayIso()
    void loadStates().then(states => {
      if (active) setN(getDueCards(content.cards, states, today).length)
    })
    return () => {
      active = false
    }
  }, [pathname])
  return n
}
