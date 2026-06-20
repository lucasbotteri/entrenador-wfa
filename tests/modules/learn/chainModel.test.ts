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
    expect(primary.nodes.map(n => n.letter)).toEqual(['H', 'A'])
    expect(primary.nodes[0]?.id).toBe('primary-habcde-h')
  })

  it('each letter node carries meaning/detail and a resolvable rationale', () => {
    const h = model.find(p => p.id === 'primary')!.nodes[0]!
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
      'scene-safety', 'scene-mechanism', 'scene-impression', 'scene-help',
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
