import type { Content } from '@/shared/content/types'

export const validContent: Content = {
  meta: { source: 'fixture', version: '0', language: 'es' },
  acronyms: [
    {
      id: 'habcde',
      acronym: 'HABCDE',
      name: 'Evaluación primaria',
      concept: 'primaria',
      isSequence: true,
      letters: [
        { letter: 'H', meaning: 'Hemorragia', detail: 'Detener hemorragia.' },
        { letter: 'A', meaning: 'Apertura de la vía aérea', detail: 'Con control cervical.' },
      ],
      rationale: 'Lo que mata primero, primero.',
    },
    {
      id: 'avdn',
      acronym: 'AVDN',
      name: 'Escala de conciencia',
      concept: 'conciencia',
      isSequence: false,
      letters: [{ letter: 'A', meaning: 'Alerta', detail: 'Orientada.' }],
      rationale: 'Mide el nivel de conciencia.',
    },
  ],
  chain: [
    {
      phase: 'scene',
      name: 'Escena',
      rationale: 'Seguridad primero.',
      content: { buscar_ayuda: 'Delegá la llamada.' },
    },
    {
      phase: 'primary',
      name: 'Primaria · HABCDE',
      rationale: 'Orden estricto.',
      strictOrder: true,
      refAcronym: 'habcde',
      content: {},
    },
    { phase: 'secondary', name: 'Secundaria', rationale: 'Buscar el resto.', content: {} },
    { phase: 'evacuation', name: 'Evacuación', rationale: 'Definir gravedad.', content: {} },
  ],
  vitalSigns: { components: ['Frecuencia cardíaca'], heartRate: { adulto: '60-100' } },
  positions: [{ situation: 'Consciente', position: 'La más confortable.' }],
  practicalRules: [{ id: 'hemorragia', rule: 'Presión directa.', concept: 'habcde' }],
  evacLevels: [
    { level: 'CRÍTICO', color: 'rojo', criterion: 'Evacuar ya.' },
    { level: 'GRAVE', color: 'ámbar', criterion: 'Se recomienda evacuar.' },
    { level: 'LEVE', color: 'verde', criterion: 'Se puede continuar.' },
  ],
  clinicalTopics: [
    { id: 'shock', name: 'Shock', rationale: 'Hipoperfusión; piel pálida, fría y húmeda.' },
  ],
  cards: [],
  workedExample: {
    title: 'Caída en descenso',
    steps: [
      {
        phase: 'primary',
        state: 'Sangrado pulsátil.',
        action: 'Controlás la hemorragia.',
        rationaleRef: 'habcde',
      },
    ],
  },
}

// Variant with a duplicate id, for the build-guard test.
export const duplicateIdContent = {
  ...validContent,
  clinicalTopics: [{ id: 'habcde', name: 'Conflict', rationale: 'r' }],
}
