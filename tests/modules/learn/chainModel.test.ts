import { describe, it, expect } from 'vitest'

import { validContent } from '../../fixtures/content.fixture'

import { buildChainModel } from '@/modules/learn/domain/chainModel'

describe('buildChainModel', () => {
  const model = buildChainModel(validContent)

  it('produces the four phases in order, carrying their guiding questions', () => {
    expect(model.map(p => p.id)).toEqual(['scene', 'primary', 'secondary', 'evacuation'])
    expect(model[0]?.questions).toEqual(['¿Es segura la escena?', '¿Cuál es el mecanismo?'])
    expect(model[2]?.questions).toBeUndefined()
  })

  it('expands HABCDE into one node per letter', () => {
    const primary = model.find(p => p.id === 'primary')!
    const letterNodes = primary.nodes.filter(n => n.kind === 'acronymLetter')
    expect(letterNodes.map(n => n.letter)).toEqual(['H', 'A', 'B'])
    expect(letterNodes[0]?.id).toBe('primary-habcde-h')
    expect(letterNodes[0]?.icon).toBe('hemorrhage')
  })

  it('each letter node carries meaning/detail, its steps as bullets and a resolvable rationale', () => {
    const h = model.find(p => p.id === 'primary')!.nodes.find(n => n.id === 'primary-habcde-h')!
    expect(h.title).toBe('Hemorragia')
    expect(h.items[0]?.detail).toContain('Detener')
    expect(h.items[0]?.bullets).toEqual([
      'Presión directa con apósitos.',
      'Torniquete a 5-8 cm si no cede.',
    ])
    expect(h.rationaleId).toBe('habcde')
  })

  it('the B node carries the PLS rule and the recovery-position steps', () => {
    const b = model.find(p => p.id === 'primary')!.nodes.find(n => n.letter === 'B')!
    expect(b.items.some(i => i.heading === 'Reglas clave' && i.detail.includes('PLS'))).toBe(true)
    const pls = b.items.find(i => i.heading === 'Posición lateral de seguridad (PLS)')
    expect(pls?.bullets).toEqual(['Arrodillate al lado.', 'Traela hacia vos.'])
  })

  it('builds decision + care + SOAP nodes for evacuation', () => {
    const evac = model.find(p => p.id === 'evacuation')!
    expect(evac.nodes.map(n => n.id)).toEqual([
      'evacuation-decision',
      'evacuation-care',
      'evacuation-soap',
    ])
    expect(evac.nodes[0]?.kind).toBe('reference')
    const critical = evac.nodes[0]!.items.find(i => i.label === 'CRÍTICO')!
    expect(critical.detail).toBe('Evacuar ya.')
    expect(critical.bullets).toEqual(['Con los mejores medios.'])
    const link = evac.nodes[0]!.items.find(i => i.link)
    expect(link?.link?.to).toBe('/quickref#criterios')
    expect(evac.nodes[2]?.title).toBe('SOAP')
  })
})

describe('scene ordered projection', () => {
  const model = buildChainModel(validContent)
  const scene = model.find(p => p.id === 'scene')!

  it('orders parts by sequence with numeric order + priority on safety', () => {
    expect(scene.nodes.map(n => n.id)).toEqual([
      'scene-safety',
      'scene-mechanism',
      'scene-victims',
      'scene-impression',
      'scene-help',
    ])
    const safety = scene.nodes[0]!
    expect(safety.order).toBe(1)
    expect(safety.priority).toBe(true)
    expect(safety.icon).toBe('safety')
    expect(scene.nodes[1]?.icon).toBe('mechanism')
  })
  it('keeps list fields as bullets (riesgos, preguntas al llegar)', () => {
    const safety = scene.nodes[0]!
    const risks = safety.items.find(i => i.label === 'Riesgos de la escena')!
    expect(risks.bullets).toEqual(['Clima', 'Rocas'])
    expect(risks.detail).toBe('Clima · Rocas')
    expect(safety.items.find(i => i.label === 'Preguntas al llegar')?.bullets).toEqual([
      '¿Es seguro el lugar?',
    ])
  })
  it('nests bioseguridad inside the safety node (not a separate node)', () => {
    const safety = scene.nodes[0]!
    expect(scene.nodes.some(n => n.id === 'scene-biosafety')).toBe(false)
    const bioStart = safety.items.findIndex(it => it.heading === 'Bioseguridad')
    expect(bioStart).toBeGreaterThanOrEqual(0)
    expect(safety.items.slice(bioStart).some(it => it.detail.includes('Guantes'))).toBe(true)
  })
  it('makes buscar_ayuda a non-numbered bridge node with its structured sub-points', () => {
    const help = scene.nodes.find(n => n.id === 'scene-help')!
    expect(help.kind).toBe('bridge')
    expect(help.order).toBeUndefined()
    expect(help.items[0]?.detail).toBe('Delegá la llamada.')
    expect(help.items.find(i => i.label === 'Números de emergencias')?.bullets).toEqual([
      'Argentina 107',
    ])
  })
  it('resolves impresion_general via TEV', () => {
    const imp = scene.nodes.find(n => n.id === 'scene-impression')!
    expect(imp.rationaleId).toBe('tev')
    expect(imp.items[0]?.label).toBe('Respiración')
    expect(imp.icon).toBe('impression')
  })
  it('the mechanism node surfaces the spine-suspicion list', () => {
    const mech = scene.nodes.find(n => n.id === 'scene-mechanism')!
    expect(mech.items.find(i => i.label === 'Sospechar lesión de columna')?.bullets).toEqual([
      'Caída de altura',
      'Dolor en el cuello',
    ])
  })
})

describe('vital values / rules / position', () => {
  const model = buildChainModel(validContent)

  it('vital-signs node shows values grouped under headings, incl. reevaluación and instability', () => {
    const vs = model
      .find(p => p.id === 'secondary')!
      .nodes.find(n => n.id === 'secondary-vital-signs')!
    const byLabel = (l: string) => vs.items.find(i => i.label === l)
    const byHeading = (h: string) => vs.items.find(i => i.heading === h)
    expect(byHeading('Frecuencia cardíaca')?.label).toBe('Adulto')
    expect(byHeading('Frecuencia cardíaca')?.detail).toBe('60-100 pulsaciones/min')
    expect(byLabel('Niños y bebés')?.detail).toBe('Niños 80-140')
    expect(byHeading('Frecuencia respiratoria')?.detail).toBe('12-20')
    expect(byLabel('Ruidos anormales')?.bullets).toEqual([
      'Estridor: agudo',
      'Sibilancias: silbido',
    ])
    expect(byLabel('Sin tensiómetro')?.detail).toContain('hipotensión severa')
    expect(byLabel('Reevaluación')?.detail).toContain('estable 15-20 min')
    expect(byLabel('Es inestable si…')?.bullets).toEqual([
      'Signos vitales cambiantes',
      'Parece gravemente enferma',
    ])
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
  it('the care node lists victim positions and the during-evacuation guidance', () => {
    const evac = model.find(p => p.id === 'evacuation')!
    const care = evac.nodes.find(n => n.id === 'evacuation-care')!
    const pos = care.items.find(i => i.heading === 'Posición de la víctima')
    expect(pos?.detail).toBe('La más confortable.')
    const labels = care.items.map(i => i.label)
    expect(labels).toContain('Comunicación')
    expect(labels).toContain('Evaluación continua')
    expect(labels).toContain('Contactar ayuda externa')
    expect(care.items.find(i => i.label === 'Contactar ayuda externa')?.heading).toBe(
      'Durante la evacuación',
    )
  })
})

describe('chainModel — primary pre-node and per-letter rationale', () => {
  const model = buildChainModel(validContent)
  const primary = model.find(p => p.id === 'primary')!

  it('primary phase prepends an "Antes de empezar" node first (P1) with the presentation steps', () => {
    expect(primary.nodes[0]?.id).toBe('primary-before')
    expect(primary.nodes[0]?.title).toBe('Antes de empezar')
    const labels = primary.nodes[0]!.items.map(i => i.label)
    expect(labels).toContain('Si no responde y no respira')
    expect(labels).toContain('Si está consciente')
    expect(labels).toContain('Orden estricto, con flexibilidad')
    const consc = primary.nodes[0]!.items.find(i => i.label === 'Si está consciente')!
    expect(consc.bullets).toEqual(['Presentate y pedí consentimiento.', 'Preguntale el nombre.'])
  })

  it('the H letter node carries its own whyText (P3), not just the acronym rationale', () => {
    const h = primary.nodes.find(n => n.id === 'primary-habcde-h')!
    expect(h.whyText).toBe('La hemorragia mata en minutos: primero.')
  })

  it('a letter without its own rationale has no whyText but keeps the rationaleId fallback (P3)', () => {
    const a = primary.nodes.find(n => n.id === 'primary-habcde-a')!
    expect(a.whyText).toBeUndefined()
    expect(a.rationaleId).toBe('habcde')
  })
})

describe('chainModel — secondary approach / exam regions / MSC', () => {
  const sec = buildChainModel(validContent).find(p => p.id === 'secondary')!

  it('opens the secondary phase with a "Cómo encararla" node built from the phase content', () => {
    expect(sec.nodes[0]?.id).toBe('secondary-approach')
    const labels = sec.nodes[0]!.items.map(i => i.label)
    expect(labels).toEqual([
      'Tomate unos minutos',
      'Línea de base',
      'Por dónde empezar',
      'Seguir acá o evacuar',
      'Es inestable si…',
      'Reevaluación',
    ])
    expect(sec.nodes[0]!.items.find(i => i.label === 'Reevaluación')?.detail).toBe(
      'estable cada 15-20 min · inestable cada 5 min',
    )
  })

  it('orders the secondary nodes: approach, vitals, AVDN, MUESTRA?, DIAS, MSC, PILAR?, rules', () => {
    expect(sec.nodes.map(n => n.id)).toEqual([
      'secondary-approach',
      'secondary-vital-signs',
      'secondary-avdn',
      'secondary-dias',
      'secondary-msc',
      'secondary-rules',
    ])
  })

  it('appends the head-to-toe regions to the DIAS node and the usage note to acronym nodes', () => {
    const dias = sec.nodes.find(n => n.id === 'secondary-dias')!
    const head = dias.items.find(i => i.label === 'Cabeza')!
    expect(head.bullets).toEqual(['Ojos y párpados', 'Oídos'])
    expect(dias.items.find(i => i.heading === 'De cabeza a pies')?.label).toBe('Secuencia')
    const avdn = sec.nodes.find(n => n.id === 'secondary-avdn')!
    expect(avdn.items.find(i => i.heading === 'Cómo se usa')?.detail).toBe('Baja siempre de A a N.')
  })
})

describe('chainModel — glove removal (Fixes4)', () => {
  it('the safety node surfaces the glove-removal technique within bioseguridad', () => {
    const scene = buildChainModel(validContent).find(p => p.id === 'scene')!
    const safety = scene.nodes.find(n => n.id === 'scene-safety')!
    const item = safety.items.find(i => i.label === 'Cómo quitarse los guantes')
    expect(item).toBeDefined()
    expect(item!.bullets?.length).toBe(2)
  })
})
