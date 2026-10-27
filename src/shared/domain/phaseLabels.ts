import type { PhaseId } from '@/shared/content/types'

// Short navigation labels for the four links of the chain (breadcrumbs, steppers).
// Navigation chrome, not clinical content: the full names live in the YAML.
export const PHASE_SHORT_LABEL: Record<PhaseId, string> = {
  scene: 'Escena',
  primary: 'Primaria',
  secondary: 'Secundaria',
  evacuation: 'Evacuación',
}

export function phaseShortLabel(id: string): string {
  return (PHASE_SHORT_LABEL as Record<string, string>)[id] ?? id
}
