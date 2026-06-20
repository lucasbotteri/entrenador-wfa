import { getStorage } from '@/shared/domain/storage'
import { KEYS } from '@/shared/domain/storage/keys'

export interface CaseProgress {
  criticalDone: number
  criticalTotal: number
  dangerous: number
  completedAt: string
}

export async function loadProgress(): Promise<Record<string, CaseProgress>> {
  const kv = await getStorage()
  return (await kv.get<Record<string, CaseProgress>>(KEYS.scenariosProgress)) ?? {}
}

export async function saveProgress(caseId: string, p: CaseProgress): Promise<void> {
  const kv = await getStorage()
  const all = (await kv.get<Record<string, CaseProgress>>(KEYS.scenariosProgress)) ?? {}
  all[caseId] = p
  await kv.set(KEYS.scenariosProgress, all)
}
