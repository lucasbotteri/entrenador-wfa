import { describe, it, expect, beforeEach } from 'vitest'

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
