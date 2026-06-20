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
        { letter: 'H', meaning: 'Hemorragia', detail: 'Detener hemorragia.', rationale: 'La hemorragia mata en minutos: primero.' },
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
    {
      id: 'tev',
      acronym: 'TEV',
      name: 'Triángulo de Evaluación Vital',
      concept: 'escena',
      isSequence: false,
      components: [{ name: 'Respiración', detail: 'Movimientos, postura.' }],
      rationale: 'Evaluación rápida sin tocar.',
    },
  ],
  chain: [
    {
      phase: 'scene',
      name: 'Escena',
      rationale: 'Seguridad primero.',
      strictOrder: true,
      sequence: [
        { order: 1, part: 'seguridad', priority: true, includes: ['bioseguridad'] },
        { order: 2, part: 'mecanismo_dano' },
        { order: 4, part: 'impresion_general' },
      ],
      next: 'buscar_ayuda',
      content: {
        seguridad: { regla: 'Deténgase y piense.', riesgos: ['Clima', 'Rocas'] },
        bioseguridad: { definicion: 'Evitar contagio.', epp: ['Guantes', 'Antiparras'] },
        mecanismo_dano: { definicion: 'Estimar causa.', regla: 'Alta energía → columna.' },
        impresion_general: { ref_sigla: 'tev' },
        buscar_ayuda: 'Delegá la llamada.',
      },
    },
    {
      phase: 'primary',
      name: 'Primaria · HABCDE',
      rationale: 'Orden estricto.',
      strictOrder: true,
      refAcronym: 'habcde',
      content: {
        previo: 'Si no responde y no respira → secuencia de paro (RCP/DEA).',
        presentacion: 'Si está consciente: presentate, pedí consentimiento.',
      },
    },
    { phase: 'secondary', name: 'Secundaria', rationale: 'Buscar el resto.', content: {} },
    { phase: 'evacuation', name: 'Evacuación', rationale: 'Definir gravedad.', content: {} },
  ],
  vitalSigns: {
    components: ['Frecuencia cardíaca'],
    heartRate: { adulto: '60-100' },
    respiratoryRate: { adulto: '12-20' },
    bloodPressure: { normal: '120/80 mmHg' },
    capillaryRefill: { normal: '< 2 segundos' },
    reevaluacion: { estable: '15-20 min', inestable: '5 min' },
  },
  positions: [{ situation: 'Consciente', position: 'La más confortable.' }],
  practicalRules: [
    { id: 'hemorragia', rule: 'Presión directa.', concept: 'habcde', letter: 'H' },
    { id: 'via-con-trauma', rule: 'Subluxación mandibular.', concept: 'habcde', letter: 'A' },
    { id: 'no-comer-beber', rule: 'Nada por boca.', concept: 'secundaria' },
  ],
  evacLevels: [
    { level: 'CRÍTICO', color: 'rojo', criterion: 'Evacuar ya.' },
    { level: 'GRAVE', color: 'ámbar', criterion: 'Se recomienda evacuar.' },
    { level: 'LEVE', color: 'verde', criterion: 'Se puede continuar.' },
  ],
  clinicalTopics: [
    { id: 'shock', name: 'Shock', rationale: 'Hipoperfusión; piel pálida, fría y húmeda.' },
  ],
  cards: [
    { id: 't-w', topic: 'HABCDE', type: 'escribir', prompt: '¿H?', answer: ['hemorragia'], rationaleRef: 'habcde' },
    { id: 't-o', topic: 'HABCDE', type: 'ordenar', prompt: 'Ordená', answer: ['H', 'A', 'B'], rationaleRef: 'habcde' },
    { id: 't-c', topic: 'AVDN', type: 'cloze', prompt: 'A {{Verbal}}', answer: ['verbal'], rationaleRef: 'avdn' },
    { id: 't-e', topic: 'Manejo', type: 'elegir', prompt: '¿Agua?', answer: ['No'], options: ['No', 'Sí'], rationaleRef: 'secundaria' },
  ],
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
