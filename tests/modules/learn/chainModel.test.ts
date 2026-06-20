import { describe, it, expect } from 'vitest'

import { validContent } from '../../fixtures/content.fixture'

import { buildChainModel } from '@/modules/learn/domain/chainModel'


describe('buildChainModel', () => {
  const model = buildChainModel(validContent)

  it('produces the four phases in order', () => {
    expect(model.map(p => p.id)).toEqual(['scene', 'primary', 'secondary', 'evacuation'])
  })

  it('expands HABCDE into one node per letter', () => {
    const primary = model.find(p => p.id === 'primary')!
    const letterNodes = primary.nodes.filter(n => n.kind === 'acronymLetter')
    expect(letterNodes.map(n => n.letter)).toEqual(['H', 'A'])
    expect(letterNodes[0]?.id).toBe('primary-habcde-h')
  })

  it('each letter node carries meaning/detail and a resolvable rationale', () => {
    const h = model.find(p => p.id === 'primary')!.nodes.find(n => n.id === 'primary-habcde-h')!
    expect(h.title).toBe('Hemorragia')
    expect(h.items[0]?.detail).toContain('Detener')
    expect(h.rationaleId).toBe('habcde')
  })

  it('builds a single evacuation decision node referencing evac levels', () => {
    const evac = model.find(p => p.id === 'evacuation')!
    expect(evac.nodes).toHaveLength(1)
    expect(evac.nodes[0]?.kind).toBe('reference')
  })
})

describe('scene ordered projection', () => {
  const model = buildChainModel(validContent)
  const scene = model.find(p => p.id === 'scene')!

  it('orders parts by sequence with numeric order + priority on safety', () => {
    expect(scene.nodes.map(n => n.id)).toEqual([
      'scene-safety', 'scene-mechanism', 'scene-victims', 'scene-impression', 'scene-help',
    ])
    const safety = scene.nodes[0]!
    expect(safety.order).toBe(1)
    expect(safety.priority).toBe(true)
  })
  it('nests bioseguridad inside the safety node (not a separate node)', () => {
    const safety = scene.nodes[0]!
    expect(scene.nodes.some(n => n.id === 'scene-biosafety')).toBe(false)
    const bioStart = safety.items.findIndex(it => it.heading === 'Bioseguridad')
    expect(bioStart).toBeGreaterThanOrEqual(0)
    expect(safety.items.slice(bioStart).some(it => it.detail.includes('Guantes'))).toBe(true)
  })
  it('makes buscar_ayuda a non-numbered bridge node', () => {
    const help = scene.nodes.find(n => n.id === 'scene-help')!
    expect(help.kind).toBe('bridge')
    expect(help.order).toBeUndefined()
    expect(help.items[0]?.detail).toBe('Delegá la llamada.')
  })
  it('resolves impresion_general via TEV', () => {
    const imp = scene.nodes.find(n => n.id === 'scene-impression')!
    expect(imp.rationaleId).toBe('tev')
    expect(imp.items[0]?.label).toBe('Respiración')
  })
})

describe('vital values / rules / position', () => {
  const model = buildChainModel(validContent)

  it('vital-signs node shows values incl. reevaluación', () => {
    const vs = model.find(p => p.id === 'secondary')!.nodes.find(n => n.id === 'secondary-vital-signs')!
    const byLabel = (l: string) => vs.items.find(i => i.label === l)?.detail
    expect(byLabel('Frecuencia cardíaca')).toBe('60-100')
    expect(byLabel('Frecuencia respiratoria')).toBe('12-20')
    expect(byLabel('Reevaluación')).toContain('estable 15-20 min')
  })
  it('HABCDE letter nodes carry their rules under "Reglas clave"', () => {
    const primary = model.find(p => p.id === 'primary')!
    const h = primary.nodes.find(n => n.letter === 'H')!
    const rule = h.items.find(i => i.heading === 'Reglas clave')
    expect(rule?.detail).toContain('Presión directa')
    const a = primary.nodes.find(n => n.letter === 'A')!
    expect(a.items.some(i => i.detail.includes('Subluxación'))).toBe(true)
  })
  it('letterless rules go to a secondary "Reglas clave" node', () => {
    const sec = model.find(p => p.id === 'secondary')!
    const rulesNode = sec.nodes.find(n => n.id === 'secondary-rules')!
    expect(rulesNode.items[0]?.detail).toBe('Nada por boca.')
  })
  it('evacuation node lists victim positions', () => {
    const evac = model.find(p => p.id === 'evacuation')!.nodes[0]!
    const pos = evac.items.find(i => i.heading === 'Posición de la víctima')
    expect(pos?.detail).toBe('La más confortable.')
  })
})

describe('chainModel — Fixes2 round (P1/P3)', () => {
  it('primary phase prepends an "Antes de empezar" node first (P1)', () => {
    const model = buildChainModel(validContent)
    const primary = model.find(p => p.id === 'primary')!
    expect(primary.nodes[0]?.id).toBe('primary-before')
    expect(primary.nodes[0]?.title).toBe('Antes de empezar')
    const labels = primary.nodes[0]!.items.map(i => i.label)
    expect(labels).toContain('Si no responde y no respira')
    expect(labels).toContain('Si está consciente')
  })

  it('the H letter node carries its own whyText (P3), not just the acronym rationale', () => {
    const model = buildChainModel(validContent)
    const primary = model.find(p => p.id === 'primary')!
    const h = primary.nodes.find(n => n.id === 'primary-habcde-h')!
    expect(h.whyText).toBe('La hemorragia mata en minutos: primero.')
  })

  it('a letter without its own rationale has no whyText but keeps the rationaleId fallback (P3)', () => {
    const model = buildChainModel(validContent)
    const primary = model.find(p => p.id === 'primary')!
    const a = primary.nodes.find(n => n.id === 'primary-habcde-a')!
    expect(a.whyText).toBeUndefined()
    expect(a.rationaleId).toBe('habcde')
  })
})

describe('chainModel — Fixes3 round (richer scene nodes P1/P2)', () => {
  const scene = buildChainModel(validContent).find(p => p.id === 'scene')!

  it('the victims node is titled "Números" and surfaces Recursos + Testigos (P1)', () => {
    const victims = scene.nodes.find(n => n.id === 'scene-victims')!
    expect(victims.title).toBe('Números')
    const byLabel = (l: string) => victims.items.find(i => i.label === l)?.detail
    expect(byLabel('Recursos')).toContain('recursos')
    expect(byLabel('Testigos / ayuda')).toContain('recurso')
  })

  it('the mechanism node surfaces orígenes / enfermedad súbita / ambiente and relabels evaluar (P2)', () => {
    const mech = scene.nodes.find(n => n.id === 'scene-mechanism')!
    const labels = mech.items.map(i => i.label)
    expect(labels).toContain('Orígenes posibles')
    expect(labels).toContain('Si es enfermedad súbita')
    expect(labels).toContain('Ambiente')
    expect(labels).toContain('Qué evaluar (en trauma)')
  })
})
