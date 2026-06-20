import { describe, it, expect, beforeEach, vi } from 'vitest'

import 'fake-indexeddb/auto'
import { createMemoryKV } from '@/shared/domain/storage'

describe('memory KV', () => {
  let kv: ReturnType<typeof createMemoryKV>
  beforeEach(() => {
    kv = createMemoryKV()
  })

  it('round-trips a value', async () => {
    await kv.set('progress:learn:lastNode', 'habcde-h')
    expect(await kv.get<string>('progress:learn:lastNode')).toBe('habcde-h')
  })

  it('deletes and clears', async () => {
    await kv.set('a', 1)
    await kv.del('a')
    expect(await kv.get('a')).toBeUndefined()
    await kv.set('b', 2)
    await kv.clear()
    expect(await kv.get('b')).toBeUndefined()
  })
})

describe('getStorage fallback', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('falls back to in-memory KV when IndexedDB probe fails', async () => {
    vi.doMock('idb-keyval', () => ({
      set: () => {
        throw new Error('no idb')
      },
      get: () => {
        throw new Error('no idb')
      },
      del: () => {
        throw new Error('no idb')
      },
      clear: () => {
        throw new Error('no idb')
      },
    }))
    const { getStorage: freshGetStorage, __resetStorage: freshReset } = await import(
      '@/shared/domain/storage'
    )
    freshReset()
    const fallbackKv = await freshGetStorage()
    await fallbackKv.set('k', 'v')
    expect(await fallbackKv.get<string>('k')).toBe('v')
    vi.doUnmock('idb-keyval')
  })
})
