import type { Content, Acronym, PhaseId } from '@/shared/content/types'
import type { ConceptIcon } from '@/shared/ui/icons'

export interface NodeItem {
  label: string
  detail: string
  why?: string
}

export type NodeKind = 'acronymLetter' | 'acronym' | 'topic' | 'reference'

export interface ChainNode {
  id: string
  phase: PhaseId
  title: string
  subtitle?: string
  icon?: ConceptIcon
  letter?: string
  kind: NodeKind
  items: NodeItem[]
  rationaleId?: string
}

export interface ChainPhase {
  id: PhaseId
  title: string
  rationale: string
  nodes: ChainNode[]
}

const PHASE_ORDER: PhaseId[] = ['scene', 'primary', 'secondary', 'evacuation']

function acronymById(content: Content, id: string): Acronym | undefined {
  return content.acronyms.find(a => a.id === id)
}

// Primary phase: one node per HABCDE letter (matches the chain-map design).
function primaryNodes(content: Content): ChainNode[] {
  const habcde = acronymById(content, 'habcde')
  if (!habcde?.letters) return []
  return habcde.letters.map(l => ({
    id: `primary-habcde-${l.letter.toLowerCase()}`,
    phase: 'primary' as const,
    title: l.meaning,
    subtitle: `Paso ${l.letter} de HABCDE`,
    letter: l.letter,
    kind: 'acronymLetter' as const,
    items: [{ label: l.meaning, detail: l.detail }],
    rationaleId: habcde.id,
  }))
}

// Secondary phase: the acronyms used in the secondary survey, each as one node
// whose items are its letters/components.
function acronymNode(content: Content, id: string, icon: ConceptIcon): ChainNode | null {
  const a = acronymById(content, id)
  if (!a) return null
  const items: NodeItem[] =
    a.letters?.map(l => ({ label: `${l.letter} · ${l.meaning}`, detail: l.detail })) ??
    a.components?.map(c => ({ label: c.name, detail: c.detail })) ??
    []
  return {
    id: `secondary-${a.id}`,
    phase: 'secondary',
    title: a.acronym,
    subtitle: a.name,
    icon,
    kind: 'acronym',
    items,
    rationaleId: a.id,
  }
}

function secondaryNodes(content: Content): ChainNode[] {
  const wanted: Array<[string, ConceptIcon]> = [
    ['avdn', 'consciousness'],
    ['muestra', 'history'],
    ['dias', 'physicalExam'],
    ['pilar', 'pupils'],
  ]
  const nodes: ChainNode[] = []
  // Vital signs node first (from vitalSigns, not an acronym).
  nodes.push({
    id: 'secondary-vital-signs',
    phase: 'secondary',
    title: 'Signos vitales',
    subtitle: 'FC · FR · temperatura',
    icon: 'vitalSigns',
    kind: 'topic',
    items: (content.vitalSigns.components ?? []).map(c => ({ label: c, detail: '' })),
    rationaleId: 'secondary',
  })
  for (const [id, icon] of wanted) {
    const n = acronymNode(content, id, icon)
    if (n) nodes.push(n)
  }
  return nodes
}

// Scene phase: derive nodes from the scene content envelope keys that exist.
function sceneNodes(content: Content): ChainNode[] {
  const phase = content.chain.find(p => p.phase === 'scene')
  const c = (phase?.content ?? {}) as Record<string, unknown>
  const nodes: ChainNode[] = []
  nodes.push({
    id: 'scene-safety',
    phase: 'scene',
    title: 'Seguridad de la escena',
    subtitle: 'bioseguridad · mecanismo · TEV',
    icon: 'scene',
    kind: 'topic',
    items: [
      {
        label: 'Seguridad',
        detail: typeof c.buscar_ayuda === 'string' ? c.buscar_ayuda : 'Deténgase y piense. Protéjase.',
      },
    ],
    rationaleId: 'scene',
  })
  return nodes
}

function evacuationNodes(content: Content): ChainNode[] {
  return [
    {
      id: 'evacuation-decision',
      phase: 'evacuation',
      title: 'Decisión de evacuación',
      subtitle: 'CRÍTICO · GRAVE · LEVE',
      icon: 'evacuation',
      kind: 'reference',
      items: content.evacLevels.map(e => ({ label: e.level, detail: e.criterion })),
      rationaleId: 'evacuation',
    },
  ]
}

const NODE_BUILDERS: Record<PhaseId, (c: Content) => ChainNode[]> = {
  scene: sceneNodes,
  primary: primaryNodes,
  secondary: secondaryNodes,
  evacuation: evacuationNodes,
}

export function buildChainModel(content: Content): ChainPhase[] {
  return PHASE_ORDER.map(id => {
    const phase = content.chain.find(p => p.phase === id)
    return {
      id,
      title: phase?.name ?? id,
      rationale: phase?.rationale ?? '',
      nodes: NODE_BUILDERS[id](content),
    }
  })
}
