import { describe, it, expect } from 'vitest'

import {
  mapAcronym,
  mapChainPhase,
  mapEvacLevel,
  mapPracticalRule,
  mapCard,
} from '@/shared/content/mapping'

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

describe('fixes mapping', () => {
  it('maps secuencia → sequence and luego → next', () => {
    const out = mapChainPhase({
      fase: 'escena', nombre: 'Escena', racional: 'r', orden_estricto: true,
      secuencia: [{ orden: 1, parte: 'seguridad', prioridad: true, incluye: ['bioseguridad'] }],
      luego: 'buscar_ayuda', contenido: { seguridad: {} },
    })
    expect(out.sequence).toEqual([{ order: 1, part: 'seguridad', priority: true, includes: ['bioseguridad'] }])
    expect(out.next).toBe('buscar_ayuda')
  })
  it('maps regla.letra → letter (omitted when absent)', () => {
    expect(mapPracticalRule({ id: 'x', regla: 'r', concepto: 'habcde', letra: 'A' })).toEqual({ id: 'x', rule: 'r', concept: 'habcde', letter: 'A' })
    expect('letter' in mapPracticalRule({ id: 'y', regla: 'r', concepto: 'secundaria' })).toBe(false)
  })
})

describe('mapCard options (M2)', () => {
  it('maps opciones → options, omits when absent', () => {
    expect(mapCard({ id: 'c', tema: 'T', tipo: 'elegir', prompt: 'p', respuesta: ['a'], opciones: ['a', 'b'], racional_ref: 'r' }).options).toEqual(['a', 'b'])
    expect('options' in mapCard({ id: 'c', tema: 'T', tipo: 'escribir', prompt: 'p', respuesta: ['a'], racional_ref: 'r' })).toBe(false)
  })
})
