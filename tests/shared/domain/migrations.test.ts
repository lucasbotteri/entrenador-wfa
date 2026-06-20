import { describe, it, expect } from 'vitest'

import { createMemoryKV } from '@/shared/domain/storage'
import { KEYS } from '@/shared/domain/storage/keys'
import { runMigrations, CURRENT_VERSION } from '@/shared/domain/storage/migrations'

describe('migrations', () => {
  it('sets version on a fresh store and is idempotent', async () => {
    const kv = createMemoryKV()
    await runMigrations(kv)
    expect(await kv.get<number>(KEYS.storageVersion)).toBe(CURRENT_VERSION)
    await runMigrations(kv) // second run no-ops
    expect(await kv.get<number>(KEYS.storageVersion)).toBe(CURRENT_VERSION)
  })
})
