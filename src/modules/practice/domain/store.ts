import type { CardState } from './srs'
import type { Streak } from './streak'

import { getStorage } from '@/shared/domain/storage'
import { KEYS } from '@/shared/domain/storage/keys'

export async function loadStates(): Promise<Record<string, CardState>> {
  const kv = await getStorage()
  return (await kv.get<Record<string, CardState>>(KEYS.practiceSrs)) ?? {}
}

export async function saveState(cardId: string, state: CardState): Promise<void> {
  const kv = await getStorage()
  const all = (await kv.get<Record<string, CardState>>(KEYS.practiceSrs)) ?? {}
  all[cardId] = state
  await kv.set(KEYS.practiceSrs, all)
}

export async function loadStreak(): Promise<Streak> {
  const kv = await getStorage()
  return (await kv.get<Streak>(KEYS.practiceStreak)) ?? { current: 0 }
}

export async function saveStreak(s: Streak): Promise<void> {
  const kv = await getStorage()
  await kv.set(KEYS.practiceStreak, s)
}
