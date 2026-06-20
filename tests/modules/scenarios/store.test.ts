import { describe, it, expect, beforeEach } from 'vitest'

import 'fake-indexeddb/auto'
import { loadProgress, saveProgress } from '@/modules/scenarios/domain/store'
import { __resetStorage } from '@/shared/domain/storage'

describe('scenarios store', () => {
  beforeEach(() => __resetStorage())
  it('round-trips case progress', async () => {
    await saveProgress('demo', { criticalDone: 2, criticalTotal: 2, dangerous: 1, completedAt: '2026-06-20' })
    expect((await loadProgress())['demo']).toMatchObject({ criticalDone: 2, dangerous: 1 })
  })
})
