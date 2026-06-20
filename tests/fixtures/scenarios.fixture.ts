import type { Case } from '@/shared/content/types'

export const fixtureCase: Case = {
  id: 'demo', title: 'Demo', tag: 'Trauma', context: 'Contexto demo', concepts: ['habcde'], modelDebrief: ['ideal'],
  phases: [
    {
      id: 'primary', state: 'No responde; sangra.', strictOrder: true,
      keyActions: [
        { id: 'H', order: 1, text: 'Control de hemorragia', critical: true, concept: 'habcde', rationale: 'Primero lo que mata.' },
        { id: 'A', order: 2, text: 'Vía aérea con control cervical', critical: true, concept: 'habcde', rationale: 'Trauma.' },
      ],
      distractors: [{ id: 'agua', text: 'Darle agua', type: 'misconcepcion', whyNot: 'No con shock.', concept: 'habcde' }],
      reveals: [{ ifDone: 'H', text: 'El sangrado es a chorro.' }],
    },
    {
      id: 'evacuation', state: 'Shock.', keyActions: [], distractors: [], reveals: [],
      decision: { correct: 'CRÍTICO', options: [
        { level: 'CRÍTICO', correct: true, feedback: 'Evacuación urgente.' },
        { level: 'LEVE', correct: false, feedback: 'Subestima el shock.' },
      ] },
    },
  ],
}
