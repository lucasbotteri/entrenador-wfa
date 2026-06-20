import { ICONS, type ConceptIcon } from '@/shared/ui/icons'

export function Icon({ concept, size = 20 }: { concept: ConceptIcon; size?: number }) {
  const Cmp = ICONS[concept]
  return <Cmp size={size} aria-hidden focusable={false} />
}
