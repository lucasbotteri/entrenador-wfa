import { KEYS } from './keys'

import type { KV } from './index'

export const CURRENT_VERSION = 1

interface Migration {
  from: number
  to: number
  run(kv: KV): Promise<void>
}

// v1 establishes the baseline; no data transforms yet.
const MIGRATIONS: Migration[] = []

export async function runMigrations(kv: KV): Promise<void> {
  let version = (await kv.get<number>(KEYS.storageVersion)) ?? 0
  for (const m of MIGRATIONS) {
    if (m.from === version) {
      await m.run(kv)
      version = m.to
    }
  }
  if (version !== CURRENT_VERSION) {
    await kv.set(KEYS.storageVersion, CURRENT_VERSION)
  }
}
