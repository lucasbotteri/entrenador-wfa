import { describe, it, expect } from 'vitest'

import { mapCase } from '@/shared/content/mapping'
import { CaseSchema } from '@/shared/content/schemas'

const rawCase = {
  id: 'c', titulo: 'T', tag: 'Trauma', contexto: 'ctx', conceptos: ['escena'],
  fases: [
    {
      id: 'primaria', estado: 'st', orden_estricto: true,
      acciones_clave: [{ id: 'H', orden: 1, texto: 'Hemorragia', critico: true, concepto: 'habcde', racional: 'r' }],
      distractores: [{ id: 'x', texto: 'mal', tipo: 'tecnica', por_que_no: 'no', concepto: 'habcde' }],
      revelaciones: [{ si_hace: 'H', revela: 'sangra' }],
      transicion: 't',
    },
    {
      id: 'evacuacion', estado: 'ev',
      decision: { correcta: 'CRÍTICO', opciones: [{ nivel: 'CRÍTICO', correcta: true, fb: 'ok' }, { nivel: 'LEVE', correcta: false, fb: 'no' }] },
    },
  ],
  debrief_modelo: ['hiciste bien'],
}

describe('CaseSchema + mapCase', () => {
  it('maps es→en and validates', () => {
    const mapped = mapCase(rawCase)
    const c = CaseSchema.parse(mapped)
    expect(c.title).toBe('T')
    expect(c.phases[0]!.id).toBe('primary')
    expect(c.phases[0]!.strictOrder).toBe(true)
    expect(c.phases[0]!.keyActions[0]).toMatchObject({ id: 'H', order: 1, text: 'Hemorragia', critical: true, concept: 'habcde', rationale: 'r' })
    expect(c.phases[0]!.distractors[0]).toMatchObject({ id: 'x', text: 'mal', type: 'tecnica', whyNot: 'no', concept: 'habcde' })
    expect(c.phases[0]!.reveals[0]).toEqual({ ifDone: 'H', text: 'sangra' })
    expect(c.phases[1]!.decision).toMatchObject({ correct: 'CRÍTICO', options: [{ level: 'CRÍTICO', correct: true, feedback: 'ok' }, { level: 'LEVE', correct: false, feedback: 'no' }] })
    expect(c.modelDebrief).toEqual(['hiciste bien'])
  })
})
