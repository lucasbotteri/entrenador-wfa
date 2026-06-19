import { describe, it, expect } from 'vitest'

import { mapAcronym, mapChainPhase, mapEvacLevel } from '@/shared/content/mapping'

describe('mapping es → en', () => {
  it('maps a letter acronym', () => {
    const out = mapAcronym({
      id: 'habcde',
      sigla: 'HABCDE',
      nombre: 'Evaluación primaria',
      concepto: 'primaria',
      es_secuencia: true,
      letras: [{ letra: 'H', significado: 'Hemorragia', detalle: 'Detener.' }],
      racional: 'Primero lo que mata.',
    })
    expect(out).toMatchObject({
      id: 'habcde',
      acronym: 'HABCDE',
      name: 'Evaluación primaria',
      concept: 'primaria',
      isSequence: true,
      rationale: 'Primero lo que mata.',
      letters: [{ letter: 'H', meaning: 'Hemorragia', detail: 'Detener.' }],
    })
  })

  it('maps a component acronym', () => {
    const out = mapAcronym({
      id: 'tev',
      sigla: 'TEV',
      nombre: 'TEV',
      concepto: 'escena',
      es_secuencia: false,
      componentes: [{ nombre: 'Respiración', detalle: 'Movimientos.' }],
      racional: 'Sin tocar.',
    })
    expect(out.components).toEqual([{ name: 'Respiración', detail: 'Movimientos.' }])
    expect(out.letters).toBeUndefined()
  })

  it('maps phase enum and envelope', () => {
    const out = mapChainPhase({
      fase: 'primaria',
      nombre: 'Primaria',
      racional: 'Orden.',
      orden_estricto: true,
      ref_sigla: 'habcde',
      contenido: { previo: 'x' },
    })
    expect(out.phase).toBe('primary')
    expect(out.strictOrder).toBe(true)
    expect(out.refAcronym).toBe('habcde')
    expect(out.content).toEqual({ previo: 'x' })
  })

  it('maps evac level', () => {
    expect(mapEvacLevel({ nivel: 'CRÍTICO', color: 'rojo', criterio: 'Evacuar ya.' })).toEqual({
      level: 'CRÍTICO',
      color: 'rojo',
      criterion: 'Evacuar ya.',
    })
  })
})
