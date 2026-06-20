import { addDays } from './dates'

export interface Streak {
  current: number
  lastDay?: string
}

export function updateStreak(s: Streak, today: string): Required<Streak> {
  if (s.lastDay === today) return { current: s.current, lastDay: today }
  if (s.lastDay && addDays(s.lastDay, 1) === today) return { current: s.current + 1, lastDay: today }
  return { current: 1, lastDay: today }
}
