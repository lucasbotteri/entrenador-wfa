import { addDays } from './dates'

export interface CardState {
  box: number
  due: string
  lastResult?: 'correct' | 'wrong'
}
export type Result = 'correct' | 'wrong'

// days until next review, indexed by box 1..5
export const INTERVALS = [1, 2, 4, 8, 16] as const

export function schedule(state: CardState | undefined, result: Result, today: string): CardState {
  if (result === 'wrong') {
    return { box: 1, due: addDays(today, 1), lastResult: 'wrong' }
  }
  const box = Math.min(5, (state?.box ?? 1) + 1)
  // box ∈ 1..5, so box - 1 is always a valid index into the 5-element INTERVALS tuple.
  return { box, due: addDays(today, INTERVALS[box - 1]!), lastResult: 'correct' }
}
