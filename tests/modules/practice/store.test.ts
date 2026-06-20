import { describe, it, expect, beforeEach } from 'vitest'

import 'fake-indexeddb/auto'
import { loadStates, saveState, loadStreak, saveStreak } from '@/modules/practice/domain/store'
import { __resetStorage } from '@/shared/domain/storage'

describe('practice store', () => {
  beforeEach(() => __resetStorage())
  it('round-trips card states', async () => {
    await saveState('t-w', { box: 2, due: '2026-06-20' })
    expect((await loadStates())['t-w']).toEqual({ box: 2, due: '2026-06-20' })
  })
  it('round-trips streak', async () => {
    await saveStreak({ current: 3, lastDay: '2026-06-19' })
    expect(await loadStreak()).toEqual({ current: 3, lastDay: '2026-06-19' })
  })
})
