import type { Content, Acronym, PhaseId } from '@/shared/content/types'
import type { ConceptIcon } from '@/shared/ui/icons'

export interface NodeItem {
  label: string
  detail: string
  // When the source value is a list, keep it as bullets (rendered as a list)
  // in addition to the joined `detail` (kept for search/compat).
  bullets?: string[]
  why?: string
  heading?: string
  link?: { to: string; label: string }
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
  questions?: string[]
  nodes: ChainNode[]
}

const PHASE_ORDER: PhaseId[] = ['scene', 'primary', 'secondary', 'evacuation']

function acronymById(content: Content, id: string): Acronym | undefined {
  return content.acronyms.find(a => a.id === id)
}

// --- generic helpers ---
function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every(x => typeof x === 'string')
}

function asDetail(v: unknown): string {
  if (typeof v === 'string') return v
  if (Array.isArray(v)) return v.filter(x => typeof x === 'string').join(' · ')
  return ''
}

// Builds one item per present field. List-valued fields keep their bullets.
function fieldItems(source: Record<string, unknown>, fields: Array<[string, string]>): NodeItem[] {
  return fields
    .map(([key, label]): NodeItem => {
      const v = source[key]
      return { label, detail: asDetail(v), ...(isStringArray(v) ? { bullets: v } : {}) }
    })
    .filter(it => it.detail !== '')
}

function withHeading(items: NodeItem[], heading: string): NodeItem[] {
  return items.map((it, i) => (i === 0 ? { ...it, heading } : it))
}

// --- vital signs values (P2) ---
function reevalText(r?: Record<string, unknown>): string | undefined {
  if (!r) return undefined
  const parts: string[] = []
  if (typeof r.estable === 'string') parts.push(`estable ${r.estable}`)
  if (typeof r.inestable === 'string') parts.push(`inestable ${r.inestable}`)
  return parts.length ? parts.join(' · ') : undefined
}

// Rows of a rate (FR/FC) group; the group heading names the sign, so the adult
// value is labelled by age.
function rateRows(v: Record<string, unknown> | undefined): NodeItem[] {
  if (!v) return []
  const unit = typeof v.unidad === 'string' ? ` ${v.unidad}` : ''
  const rows: NodeItem[] = []
  if (typeof v.adulto === 'string') rows.push({ label: 'Adulto', detail: `${v.adulto}${unit}` })
  const kids: string[] = []
  if (typeof v.nino === 'string') kids.push(`Niños ${v.nino}`)
  if (typeof v.bebe === 'string') kids.push(`Bebés ${v.bebe}`)
  if (kids.length) rows.push({ label: 'Niños y bebés', detail: kids.join(' · ') })
  return rows
}

function vitalSignItems(vs: Content['vitalSigns']): NodeItem[] {
  const v = vs as Record<string, Record<string, unknown> | unknown>
  const rr = isRecord(v.respiratoryRate) ? v.respiratoryRate : undefined
  const hr = isRecord(v.heartRate) ? v.heartRate : undefined
  const bp = isRecord(v.bloodPressure) ? v.bloodPressure : undefined
  const temp = isRecord(v.temperature) ? v.temperature : undefined
  const skin = isRecord(v.skin) ? v.skin : undefined
  const cap = isRecord(v.capillaryRefill) ? v.capillaryRefill : undefined
  const reeval = isRecord(v.reevaluacion) ? v.reevaluacion : undefined

  const groups: NodeItem[][] = []

  groups.push([
    ...rateRows(rr),
    ...(rr
      ? fieldItems(rr, [
          ['tecnica', 'Técnica'],
          ['calidad', 'Calidad'],
          ['ruidos', 'Ruidos anormales'],
        ])
      : []),
  ])
  groups.push([
    ...rateRows(hr),
    ...(hr
      ? fieldItems(hr, [
          ['tecnica', 'Técnica'],
          ['sitio', 'Dónde tomarlo'],
          ['sitios', 'Otros pulsos'],
          ['amplitud', 'Amplitud'],
          ['regularidad', 'Regularidad'],
        ])
      : []),
  ])
  if (bp) {
    groups.push([
      ...(typeof bp.normal === 'string' ? [{ label: 'Normal', detail: bp.normal }] : []),
      ...fieldItems(bp, [
        ['hipertension', 'Hipertensión'],
        ['hipotension', 'Hipotensión'],
        ['metodo', 'Método'],
        ['palpacion', 'Sin tensiómetro'],
        ['significado', 'Qué indica'],
      ]),
    ])
  }
  if (temp)
    groups.push(
      fieldItems(temp, [
        ['referencia', 'Temperatura'],
        ['sin_termometro', 'Sin termómetro'],
      ]),
    )
  if (skin) {
    groups.push(
      fieldItems(skin, [
        ['color', 'Color'],
        ['temperatura', 'Temperatura'],
        ['humedad', 'Humedad'],
        ['shock', 'Piel de shock'],
        ['interpretacion', 'Qué indica'],
      ]),
    )
  }
  if (cap) {
    groups.push([
      ...(typeof cap.normal === 'string' ? [{ label: 'Normal', detail: cap.normal }] : []),
      ...fieldItems(cap, [
        ['tecnica', 'Técnica'],
        ['nota', 'Ojo'],
      ]),
    ])
  }
  const re = reevalText(reeval)
  const followUp: NodeItem[] = []
  if (re) followUp.push({ label: 'Reevaluación', detail: re })
  if (isStringArray(v.unstableIf))
    followUp.push({
      label: 'Es inestable si…',
      detail: asDetail(v.unstableIf),
      bullets: v.unstableIf,
    })
  if (typeof v.record === 'string') followUp.push({ label: 'Registro', detail: v.record })
  groups.push(followUp)

  // Headings are positional over the groups actually pushed; bp/temp/skin/cap may be absent.
  const labels: string[] = ['Frecuencia respiratoria', 'Frecuencia cardíaca']
  if (bp) labels.push('Presión arterial')
  if (temp) labels.push('Temperatura')
  if (skin) labels.push('Piel')
  if (cap) labels.push('Relleno capilar')
  labels.push('Seguimiento')
  return groups.flatMap((g, i) => (g.length ? withHeading(g, labels[i] ?? '') : []))
}

// --- practical rules (P3) ---
function rulesForLetter(content: Content, letter: string): NodeItem[] {
  return content.practicalRules
    .filter(r => r.letter === letter)
    .map(
      (r, i): NodeItem => ({
        label: 'Regla',
        detail: r.rule,
        ...(i === 0 ? { heading: 'Reglas clave' } : {}),
      }),
    )
}

const LETTER_ICONS: Record<string, ConceptIcon> = {
  H: 'hemorrhage',
  A: 'airway',
  B: 'breathing',
  C: 'circulation',
  D: 'deficit',
  E: 'exposure',
}

// The pre-HABCDE safety branch (P1): shown as the first node of the primary phase.
function primaryBeforeNode(content: Content): ChainNode | null {
  const phase = content.chain.find(p => p.phase === 'primary')
  const c = (phase?.content ?? {}) as Record<string, unknown>
  const items: NodeItem[] = []
  if (typeof c.previo === 'string')
    items.push({ label: 'Si no responde y no respira', detail: c.previo })
  if (typeof c.presentacion === 'string') {
    items.push({
      label: 'Si está consciente',
      detail: c.presentacion,
      ...(isStringArray(c.presentacion_pasos) ? { bullets: c.presentacion_pasos } : {}),
    })
  }
  items.push(
    ...fieldItems(c, [
      ['objetivo', 'Objetivo de la primaria'],
      ['flexibilidad', 'Orden estricto, con flexibilidad'],
    ]),
  )
  if (items.length === 0) return null
  return {
    id: 'primary-before',
    phase: 'primary',
    title: 'Antes de empezar',
    subtitle: '¿Paro? ¿Consciente?',
    icon: 'before',
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
  const letterNodes: ChainNode[] = habcde.letters.map(l => {
    const items: NodeItem[] = [
      { label: l.meaning, detail: l.detail, ...(l.steps ? { bullets: l.steps } : {}) },
      ...rulesForLetter(content, l.letter),
    ]
    if (l.letter === 'B' && content.recoveryPositionSteps.length) {
      items.push({
        heading: 'Posición lateral de seguridad (PLS)',
        label: 'Cómo ponerla de costado',
        detail: asDetail(content.recoveryPositionSteps),
        bullets: content.recoveryPositionSteps,
      })
    }
    const icon = LETTER_ICONS[l.letter]
    return {
      id: `primary-habcde-${l.letter.toLowerCase()}`,
      phase: 'primary' as const,
      title: l.meaning,
      subtitle: `Paso ${l.letter} de HABCDE`,
      letter: l.letter,
      ...(icon ? { icon } : {}),
      kind: 'acronymLetter' as const,
      items,
      rationaleId: habcde.id,
      ...(l.rationale ? { whyText: l.rationale } : {}),
    }
  })
  const before = primaryBeforeNode(content)
  return before ? [before, ...letterNodes] : letterNodes
}

// Acronym node: items are its letters/components, plus its usage note.
function acronymNode(
  content: Content,
  id: string,
  icon: ConceptIcon,
  phase: PhaseId,
  nodeId: string,
  extra: NodeItem[] = [],
): ChainNode | null {
  const a = acronymById(content, id)
  if (!a) return null
  const items: NodeItem[] =
    a.letters?.map(l => ({ label: `${l.letter} · ${l.meaning}`, detail: l.detail })) ??
    a.components?.map(c => ({ label: c.name, detail: c.detail })) ??
    []
  if (a.note) items.push({ heading: 'Cómo se usa', label: 'Nota', detail: a.note })
  return {
    id: nodeId,
    phase,
    title: a.acronym,
    subtitle: a.name,
    icon,
    kind: 'acronym',
    items: [...items, ...extra],
    rationaleId: a.id,
  }
}

function secondaryApproachNode(content: Content): ChainNode | null {
  const phase = content.chain.find(p => p.phase === 'secondary')
  const c = (phase?.content ?? {}) as Record<string, unknown>
  const items = fieldItems(c, [
    ['intro', 'Tomate unos minutos'],
    ['linea_base', 'Línea de base'],
    ['orden', 'Por dónde empezar'],
    ['decision_evacuar', 'Seguir acá o evacuar'],
    ['inestable_si', 'Es inestable si…'],
  ])
  const re = isRecord(c.reevaluacion) ? reevalText(c.reevaluacion) : undefined
  if (re) items.push({ label: 'Reevaluación', detail: re })
  items.push(
    ...fieldItems(c, [
      ['datos_victima', 'Datos de la víctima'],
      ['distracciones', 'Seguí la secuencia'],
    ]),
  )
  if (items.length === 0) return null
  return {
    id: 'secondary-approach',
    phase: 'secondary',
    title: 'Cómo encararla',
    subtitle: 'Línea de base · ¿seguir o evacuar?',
    icon: 'approach',
    kind: 'topic',
    items,
    rationaleId: 'secondary',
  }
}

function examRegionItems(content: Content): NodeItem[] {
  const phase = content.chain.find(p => p.phase === 'secondary')
  const c = (phase?.content ?? {}) as Record<string, unknown>
  const exam = isRecord(c.examen_fisico) ? c.examen_fisico : undefined
  if (!exam) return []
  const items: NodeItem[] = fieldItems(exam, [['secuencia', 'Secuencia']])
  const regions = Array.isArray(exam.regiones) ? exam.regiones : []
  for (const r of regions) {
    if (!isRecord(r) || typeof r.zona !== 'string') continue
    const checks = isStringArray(r.revisar) ? r.revisar : []
    items.push({ label: r.zona, detail: asDetail(checks), bullets: checks })
  }
  return items.length ? withHeading(items, 'De cabeza a pies') : []
}

function secondaryNodes(content: Content): ChainNode[] {
  const nodes: ChainNode[] = []
  const approach = secondaryApproachNode(content)
  if (approach) nodes.push(approach)
  nodes.push({
    id: 'secondary-vital-signs',
    phase: 'secondary',
    title: 'Signos vitales',
    subtitle: 'FR · FC · PA · piel · pupilas · AVDN',
    icon: 'vitalSigns',
    kind: 'topic',
    items: vitalSignItems(content.vitalSigns),
    rationaleId: 'secondary',
  })
  const wanted: Array<[string, ConceptIcon, NodeItem[]]> = [
    ['avdn', 'consciousness', []],
    ['muestra', 'history', []],
    ['dias', 'physicalExam', examRegionItems(content)],
    ['msc', 'extremities', []],
    ['pilar', 'pupils', []],
  ]
  for (const [id, icon, extra] of wanted) {
    const n = acronymNode(content, id, icon, 'secondary', `secondary-${id}`, extra)
    if (n) nodes.push(n)
  }
  const looseRules = content.practicalRules.filter(r => !r.letter)
  if (looseRules.length) {
    nodes.push({
      id: 'secondary-rules',
      phase: 'secondary',
      title: 'Reglas clave',
      icon: 'rules',
      kind: 'topic',
      rationaleId: 'secondary',
      items: looseRules.map(r => ({ label: 'Regla', detail: r.rule })),
    })
  }
  return nodes
}

// --- scene helpers (P1) ---
interface ScenePartDef {
  id: string
  title: string
  icon: ConceptIcon
  fields: Array<[string, string]>
}

const SCENE_PART_DEFS: Record<string, ScenePartDef> = {
  seguridad: {
    id: 'scene-safety',
    title: 'Seguridad de la escena',
    icon: 'safety',
    fields: [
      ['regla', 'Regla'],
      ['preguntas_al_llegar', 'Preguntas al llegar'],
      ['riesgos', 'Riesgos de la escena'],
    ],
  },
  mecanismo_dano: {
    id: 'scene-mechanism',
    title: 'Mecanismo de daño',
    icon: 'mechanism',
    fields: [
      ['definicion', 'Qué es'],
      ['origenes', 'Orígenes posibles'],
      ['evaluar', 'Qué evaluar (en trauma)'],
      ['preguntas_escalada', 'Preguntas ante una caída'],
      ['fisica', 'Física del trauma'],
      ['sospechar_lesiones_graves', 'Sospechar lesiones graves'],
      ['sospechar_columna', 'Sospechar lesión de columna'],
      ['enfermedad_subita', 'Si es enfermedad súbita'],
      ['ambiente', 'Ambiente'],
      ['regla', 'Regla'],
    ],
  },
  numero_victimas: {
    id: 'scene-victims',
    title: 'Números',
    icon: 'victims',
    fields: [
      ['definicion', 'Qué es'],
      ['recursos', 'Recursos'],
      ['triage', 'Triage'],
      ['testigos', 'Testigos / ayuda'],
      ['nota', 'Nota'],
    ],
  },
}

const BIOSAFETY_FIELDS: Array<[string, string]> = [
  ['definicion', 'Qué es'],
  ['epp', 'Equipo de protección (EPP)'],
  ['sin_guantes', 'Sin guantes'],
  ['quitarse_guantes', 'Cómo quitarse los guantes'],
  ['transmision_sangre', 'Transmisión por sangre'],
  ['transmision_aire', 'Transmisión por aire'],
  ['lavado_manos', 'Lavado de manos'],
  ['vacunas', 'Vacunas'],
]

const HELP_FIELDS: Array<[string, string]> = [
  ['resumen', 'En resumen'],
  ['calma', 'Primero'],
  ['grupo', 'Tu grupo de rescate'],
  ['sem', 'Llamar al SEM'],
  ['datos_sem', 'Qué te va a pedir el operador'],
  ['numeros', 'Números de emergencias'],
  ['remoto', 'En lugares remotos: ayuda externa (AE)'],
  ['senales', 'Señalizar para el rescate'],
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
  const items: NodeItem[] = a.components.map(comp => ({ label: comp.name, detail: comp.detail }))
  if (a.note) items.push({ heading: 'Cómo se usa', label: 'Nota', detail: a.note })
  return {
    id: 'scene-impression',
    phase: 'scene',
    title: 'Impresión general',
    subtitle: a.name,
    icon: 'impression',
    order,
    kind: 'topic',
    items,
    rationaleId: a.id,
  }
}

function sceneHelpNode(source: unknown): ChainNode | null {
  let items: NodeItem[] = []
  if (typeof source === 'string') items = [{ label: 'Buscar ayuda', detail: source }]
  else if (isRecord(source)) items = fieldItems(source, HELP_FIELDS)
  if (items.length === 0) return null
  return {
    id: 'scene-help',
    phase: 'scene',
    title: 'Buscar ayuda',
    subtitle: 'SEM · ayuda externa',
    kind: 'bridge',
    items,
    rationaleId: 'scene',
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
        items = items.concat(
          withHeading(fieldItems(c.bioseguridad, BIOSAFETY_FIELDS), 'Bioseguridad'),
        )
      }
    }
    if (items.length === 0) continue
    nodes.push({
      id: def.id,
      phase: 'scene',
      title: def.title,
      icon: def.icon,
      order: part.order,
      kind: 'topic',
      items,
      ...(part.priority ? { priority: true } : {}),
      rationaleId: 'scene',
    })
  }

  const next = phase.next
  if (typeof next === 'string') {
    const help = sceneHelpNode(c[next])
    if (help) nodes.push(help)
  }

  return nodes
}

const EVAC_GUIDANCE_FIELDS: Array<[string, string]> = [
  ['contactar_ae', 'Contactar ayuda externa'],
  ['evaluacion_continua', 'Evaluación continua'],
  ['comunicacion', 'Comunicación'],
]

function evacuationNodes(content: Content): ChainNode[] {
  const levelItems: NodeItem[] = content.evacLevels.map(e => ({
    label: e.level,
    detail: e.criterion,
    ...(e.conduct ? { bullets: [e.conduct] } : {}),
  }))
  const criteriaLink: NodeItem[] = content.evacCriteria.length
    ? [
        {
          heading: 'Aplicarlo a un cuadro',
          label: 'Criterios por cuadro',
          detail:
            'Dado un cuadro concreto (herida, fractura, hipotermia, mal de altura…), qué nivel corresponde según el manual.',
          link: { to: '/quickref#criterios', label: 'Ver la tabla en Referencia rápida' },
        },
      ]
    : []
  const positionItems: NodeItem[] = (content.positions ?? []).map((p, i) => ({
    label: p.situation,
    detail: p.position,
    ...(i === 0 ? { heading: 'Posición de la víctima' } : {}),
  }))
  const phase = content.chain.find(p => p.phase === 'evacuation')
  const c = (phase?.content ?? {}) as Record<string, unknown>
  const guidanceItems = withHeading(fieldItems(c, EVAC_GUIDANCE_FIELDS), 'Durante la evacuación')

  const nodes: ChainNode[] = [
    {
      id: 'evacuation-decision',
      phase: 'evacuation',
      title: 'Decisión de evacuación',
      subtitle: 'CRÍTICO · GRAVE · LEVE',
      icon: 'evacuation',
      kind: 'reference',
      items: [...levelItems, ...criteriaLink],
      rationaleId: 'evacuation',
    },
  ]
  const careItems = [...guidanceItems, ...positionItems]
  if (careItems.length) {
    nodes.push({
      id: 'evacuation-care',
      phase: 'evacuation',
      title: 'Control y cuidado',
      subtitle: 'AE · reevaluar · comunicar · posición',
      icon: 'care',
      kind: 'topic',
      items: careItems,
      rationaleId: 'evacuation',
    })
  }
  const soap = acronymNode(content, 'soap', 'record', 'evacuation', 'evacuation-soap')
  if (soap) nodes.push(soap)
  return nodes
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
      ...(phase?.questions?.length ? { questions: phase.questions } : {}),
      nodes: NODE_BUILDERS[id](content),
    }
  })
}
