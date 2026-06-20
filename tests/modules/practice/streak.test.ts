import { describe, it, expect } from 'vitest'

import { updateStreak } from '@/modules/practice/domain/streak'

describe('updateStreak', () => {
  it('same day is a no-op', () => {
    expect(updateStreak({ current: 3, lastDay: '2026-06-19' }, '2026-06-19')).toEqual({ current: 3, lastDay: '2026-06-19' })
  })
  it('consecutive day increments', () => {
    expect(updateStreak({ current: 3, lastDay: '2026-06-18' }, '2026-06-19')).toEqual({ current: 4, lastDay: '2026-06-19' })
  })
  it('gap resets to 1', () => {
    expect(updateStreak({ current: 9, lastDay: '2026-06-10' }, '2026-06-19')).toEqual({ current: 1, lastDay: '2026-06-19' })
  })
  it('first ever → 1', () => {
    expect(updateStreak({ current: 0 }, '2026-06-19')).toEqual({ current: 1, lastDay: '2026-06-19' })
  })
})
