import type { Case } from '@/shared/content/types'

export function getCase(cases: Case[], id: string): Case | null {
  return cases.find(c => c.id === id) ?? null
}

export function allCases(cases: Case[]): Case[] {
  return cases
}
