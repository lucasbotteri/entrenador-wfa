import type { Content, Acronym, PhaseId } from '@/shared/content/types'
import type { ConceptIcon } from '@/shared/ui/icons'

export interface NodeItem {
  label: string
  detail: string
  why?: string
  heading?: string
}

export type NodeKind = 'acronymLetter' | 'acronym' | 'topic' | 'reference' | 'bridge'

export interface ChainNode {
  id: string
  phase: PhaseId
  title: string
  subtitle?: string
  icon?: ConceptIcon
  letter?: string
  order?: number
  priority?: boolean
  kind: NodeKind
  items: NodeItem[]
  rationaleId?: string
  whyText?: string
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

// --- vital signs values (P2) ---
function reevalText(r?: Record<string, unknown>): string | undefined {
  if (!r) return undefined
  const parts: string[] = []
  if (typeof r.estable === 'string') parts.push(`estable ${r.estable}`)
  if (typeof r.inestable === 'string') parts.push(`inestable ${r.inestable}`)
  return parts.length ? parts.join(' · ') : undefined
}

function vitalSignItems(vs: Content['vitalSigns']): NodeItem[] {
  const v = vs as Record<string, Record<string, unknown> | undefined>
  const rows: Array<[string, unknown]> = [
    ['Frecuencia respiratoria', v.respiratoryRate?.adulto],
    ['Frecuencia cardíaca', v.heartRate?.adulto],
    ['Presión arterial', v.bloodPressure?.normal],
    ['Relleno capilar', v.capillaryRefill?.normal],
    ['Reevaluación', reevalText(v.reevaluacion)],
  ]
  return rows
    .filter((r): r is [string, string] => typeof r[1] === 'string')
    .map(([label, detail]) => ({ label, detail }))
}

// --- practical rules (P3) ---
function rulesForLetter(content: Content, letter: string): NodeItem[] {
  return content.practicalRules
    .filter(r => r.letter === letter)
    .map((r, i): NodeItem => ({ label: 'Regla', detail: r.rule, ...(i === 0 ? { heading: 'Reglas clave' } : {}) }))
}

// The pre-HABCDE safety branch (P1): shown as the first node of the primary phase.
function primaryBeforeNode(content: Content): ChainNode | null {
  const phase = content.chain.find(p => p.phase === 'primary')
  const c = (phase?.content ?? {}) as Record<string, unknown>
  const items: NodeItem[] = []
  if (typeof c.previo === 'string') items.push({ label: 'Si no responde y no respira', detail: c.previo })
  if (typeof c.presentacion === 'string') items.push({ label: 'Si está consciente', detail: c.presentacion })
  if (items.length === 0) return null
  return {
    id: 'primary-before',
    phase: 'primary',
    title: 'Antes de empezar',
    kind: 'topic',
    items,
    rationaleId: 'primary',
  }
}

// Primary phase: the safety branch first, then one node per HABCDE letter.
// Each letter node carries its own whyText (P3) when the content provides one,
// falling back to the acronym-level rationale via rationaleId.
function primaryNodes(content: Content): ChainNode[] {
  const habcde = acronymById(content, 'habcde')
  if (!habcde?.letters) return []
  const letterNodes: ChainNode[] = habcde.letters.map(l => ({
    id: `primary-habcde-${l.letter.toLowerCase()}`,
    phase: 'primary' as const,
    title: l.meaning,
    subtitle: `Paso ${l.letter} de HABCDE`,
    letter: l.letter,
    kind: 'acronymLetter' as const,
    items: [{ label: l.meaning, detail: l.detail }, ...rulesForLetter(content, l.letter)],
    rationaleId: habcde.id,
    ...(l.rationale ? { whyText: l.rationale } : {}),
  }))
  const before = primaryBeforeNode(content)
  return before ? [before, ...letterNodes] : letterNodes
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
  nodes.push({
    id: 'secondary-vital-signs',
    phase: 'secondary',
    title: 'Signos vitales',
    subtitle: 'FC · FR · PA',
    icon: 'vitalSigns',
    kind: 'topic',
    items: vitalSignItems(content.vitalSigns),
    rationaleId: 'secondary',
  })
  for (const [id, icon] of wanted) {
    const n = acronymNode(content, id, icon)
    if (n) nodes.push(n)
  }
  const looseRules = content.practicalRules.filter(r => !r.letter)
  if (looseRules.length) {
    nodes.push({
      id: 'secondary-rules',
      phase: 'secondary',
      title: 'Reglas clave',
      kind: 'topic',
      rationaleId: 'secondary',
      items: looseRules.map(r => ({ label: 'Regla', detail: r.rule })),
    })
  }
  return nodes
}

// --- scene helpers (P1) ---
function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function asDetail(v: unknown): string {
  if (typeof v === 'string') return v
  if (Array.isArray(v)) return v.filter(x => typeof x === 'string').join(' · ')
  return ''
}

function fieldItems(source: Record<string, unknown>, fields: Array<[string, string]>): NodeItem[] {
  return fields
    .map(([key, label]): NodeItem => ({ label, detail: asDetail(source[key]) }))
    .filter(it => it.detail !== '')
}

function withHeading(items: NodeItem[], heading: string): NodeItem[] {
  return items.map((it, i) => (i === 0 ? { ...it, heading } : it))
}

interface ScenePartDef {
  id: string
  title: string
  fields: Array<[string, string]>
}

const SCENE_PART_DEFS: Record<string, ScenePartDef> = {
  seguridad: {
    id: 'scene-safety',
    title: 'Seguridad de la escena',
    fields: [
      ['regla', 'Regla'],
      ['riesgos', 'Riesgos de la escena'],
    ],
  },
  mecanismo_dano: {
    id: 'scene-mechanism',
    title: 'Mecanismo de daño',
    fields: [
      ['definicion', 'Qué es'],
      ['evaluar', 'Qué evaluar'],
      ['sospechar_lesiones_graves', 'Sospechar lesiones graves'],
      ['regla', 'Regla'],
    ],
  },
  numero_victimas: {
    id: 'scene-victims',
    title: 'Número de víctimas',
    fields: [
      ['definicion', 'Qué es'],
      ['triage', 'Triage'],
      ['nota', 'Nota'],
    ],
  },
}

const BIOSAFETY_FIELDS: Array<[string, string]> = [
  ['definicion', 'Qué es'],
  ['epp', 'Equipo de protección (EPP)'],
  ['transmision_sangre', 'Transmisión por sangre'],
  ['transmision_aire', 'Transmisión por aire'],
  ['lavado_manos', 'Lavado de manos'],
]

function sceneImpressionNode(
  content: Content,
  c: Record<string, unknown>,
  order: number,
): ChainNode | null {
  const ref = isRecord(c.impresion_general) ? c.impresion_general.ref_sigla : undefined
  if (typeof ref !== 'string') return null
  const a = acronymById(content, ref)
  if (!a?.components) return null
  return {
    id: 'scene-impression',
    phase: 'scene',
    title: 'Impresión general',
    subtitle: a.name,
    order,
    kind: 'topic',
    items: a.components.map(comp => ({ label: comp.name, detail: comp.detail })),
    rationaleId: a.id,
  }
}

function sceneNodes(content: Content): ChainNode[] {
  const phase = content.chain.find(p => p.phase === 'scene')
  if (!phase) return []
  const c = phase.content as Record<string, unknown>
  const sequence = (phase.sequence ?? []).slice().sort((a, b) => a.order - b.order)
  const nodes: ChainNode[] = []

  for (const part of sequence) {
    if (part.part === 'impresion_general') {
      const n = sceneImpressionNode(content, c, part.order)
      if (n) nodes.push(n)
      continue
    }
    const def = SCENE_PART_DEFS[part.part]
    const source = c[part.part]
    if (!def || !isRecord(source)) continue
    let items = fieldItems(source, def.fields)
    for (const inc of part.includes ?? []) {
      if (inc === 'bioseguridad' && isRecord(c.bioseguridad)) {
        items = items.concat(withHeading(fieldItems(c.bioseguridad, BIOSAFETY_FIELDS), 'Bioseguridad'))
      }
    }
    if (items.length === 0) continue
    nodes.push({
      id: def.id,
      phase: 'scene',
      title: def.title,
      order: part.order,
      kind: 'topic',
      items,
      ...(part.priority ? { priority: true } : {}),
      rationaleId: 'scene',
    })
  }

  const next = phase.next
  if (typeof next === 'string' && typeof c[next] === 'string') {
    nodes.push({
      id: 'scene-help',
      phase: 'scene',
      title: 'Buscar ayuda',
      kind: 'bridge',
      items: [{ label: 'Buscar ayuda', detail: c[next] as string }],
    })
  }

  return nodes
}

function evacuationNodes(content: Content): ChainNode[] {
  const levelItems: NodeItem[] = content.evacLevels.map(e => ({ label: e.level, detail: e.criterion }))
  const positionItems: NodeItem[] = (content.positions ?? []).map((p, i) => ({
    label: p.situation,
    detail: p.position,
    ...(i === 0 ? { heading: 'Posición de la víctima' } : {}),
  }))
  return [
    {
      id: 'evacuation-decision',
      phase: 'evacuation',
      title: 'Decisión de evacuación',
      subtitle: 'CRÍTICO · GRAVE · LEVE',
      icon: 'evacuation',
      kind: 'reference',
      items: [...levelItems, ...positionItems],
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
