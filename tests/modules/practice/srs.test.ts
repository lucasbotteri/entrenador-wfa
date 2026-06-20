import { describe, it, expect } from 'vitest'

import { addDays } from '@/modules/practice/domain/dates'
import { schedule, INTERVALS } from '@/modules/practice/domain/srs'

describe('srs', () => {
  it('addDays adds calendar days (ISO)', () => {
    expect(addDays('2026-06-19', 4)).toBe('2026-06-23')
  })
  it('correct bumps box and schedules by interval', () => {
    const s = schedule({ box: 1, due: '2026-06-19' }, 'correct', '2026-06-19')
    expect(s.box).toBe(2)
    expect(s.due).toBe(addDays('2026-06-19', INTERVALS[1]))
    expect(s.lastResult).toBe('correct')
  })
  it('correct caps at box 5', () => {
    expect(schedule({ box: 5, due: '2026-06-19' }, 'correct', '2026-06-19').box).toBe(5)
  })
  it('wrong resets to box 1 due tomorrow', () => {
    const s = schedule({ box: 4, due: '2026-06-19' }, 'wrong', '2026-06-19')
    expect(s.box).toBe(1)
    expect(s.due).toBe('2026-06-20')
  })
  it('new card (undefined state) on correct → box 2', () => {
    expect(schedule(undefined, 'correct', '2026-06-19').box).toBe(2)
  })
})
