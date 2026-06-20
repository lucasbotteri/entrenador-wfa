import { get as idbGet, set as idbSet, del as idbDel, clear as idbClear } from 'idb-keyval'

export interface KV {
  get<T>(key: string): Promise<T | undefined>
  set<T>(key: string, value: T): Promise<void>
  del(key: string): Promise<void>
  clear(): Promise<void>
}

export function createMemoryKV(): KV {
  const m = new Map<string, unknown>()
  return {
    async get<T>(k: string) {
      return m.get(k) as T | undefined
    },
    async set<T>(k: string, v: T) {
      m.set(k, v)
    },
    async del(k: string) {
      m.delete(k)
    },
    async clear() {
      m.clear()
    },
  }
}

function createIdbKV(): KV {
  return {
    get: <T>(k: string) => idbGet<T>(k),
    set: <T>(k: string, v: T) => idbSet(k, v),
    del: (k: string) => idbDel(k),
    clear: () => idbClear(),
  }
}

async function probe(): Promise<boolean> {
  try {
    await idbSet('__wfa_probe__', 1)
    await idbDel('__wfa_probe__')
    return true
  } catch {
    return false
  }
}

let cached: KV | null = null
export async function getStorage(): Promise<KV> {
  if (cached) return cached
  cached = (await probe()) ? createIdbKV() : createMemoryKV()
  return cached
}

// test-only reset
export function __resetStorage() {
  cached = null
}
