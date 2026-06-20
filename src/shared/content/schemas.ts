import { z } from 'zod'

export const AcronymLetterSchema = z.object({
  letter: z.string().min(1).max(2),
  meaning: z.string().min(1),
  detail: z.string().min(1),
})

export const AcronymComponentSchema = z.object({
  name: z.string().min(1),
  detail: z.string().min(1),
})

export const AcronymSchema = z.object({
  id: z.string().min(1),
  acronym: z.string().min(1),
  name: z.string().min(1),
  concept: z.string().min(1),
  isSequence: z.boolean(),
  letters: z.array(AcronymLetterSchema).optional(),
  components: z.array(AcronymComponentSchema).optional(),
  definition: z.string().optional(),
  note: z.string().optional(),
  rationale: z.string().min(1),
})

export const PhaseIdSchema = z.enum(['scene', 'primary', 'secondary', 'evacuation'])

// Phase content is heterogeneous (spec §4.2). We validate the structural envelope
// strictly and preserve the deep clinical detail with passthrough so unmodeled
// leaves never break the build but are carried through to the JSON.
export const ChainPhaseSchema = z.object({
  phase: PhaseIdSchema,
  name: z.string().min(1),
  rationale: z.string().min(1),
  refAcronym: z.string().optional(),
  strictOrder: z.boolean().optional(),
  content: z.record(z.unknown()),
})

export const VitalSignsSchema = z
  .object({
    components: z.array(z.string()).optional(),
    respiratoryRate: z.record(z.unknown()).optional(),
    heartRate: z.record(z.unknown()).optional(),
    bloodPressure: z.record(z.unknown()).optional(),
    skin: z.record(z.unknown()).optional(),
    capillaryRefill: z.record(z.unknown()).optional(),
  })
  .passthrough()

export const EvacLevelSchema = z.object({
  level: z.string().min(1),
  color: z.string().min(1),
  criterion: z.string().min(1),
})

export const PracticalRuleSchema = z.object({
  id: z.string().min(1),
  rule: z.string().min(1),
  concept: z.string().min(1),
})

export const ClinicalTopicSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  rationale: z.string().min(1),
})

export const CardSchema = z
  .object({
    id: z.string().min(1),
    topic: z.string().min(1),
    type: z.enum(['ordenar', 'escribir', 'cloze', 'elegir']),
    prompt: z.string().min(1),
    answer: z.array(z.string()).min(1),
    rationaleRef: z.string().min(1),
  })
  .passthrough()

export const WorkedExampleStepSchema = z.object({
  phase: PhaseIdSchema,
  state: z.string().min(1),
  action: z.string().min(1),
  rationaleRef: z.string().min(1),
})

export const WorkedExampleSchema = z.object({
  title: z.string().min(1),
  steps: z.array(WorkedExampleStepSchema).min(1),
})

export const ContentSchema = z.object({
  meta: z.object({ source: z.string(), version: z.string(), language: z.string() }).passthrough(),
  acronyms: z.array(AcronymSchema).min(1),
  chain: z.array(ChainPhaseSchema).min(1),
  vitalSigns: VitalSignsSchema,
  positions: z.array(z.object({ situation: z.string(), position: z.string() })).optional(),
  practicalRules: z.array(PracticalRuleSchema),
  evacLevels: z.array(EvacLevelSchema).min(1),
  clinicalTopics: z.array(ClinicalTopicSchema),
  cards: z.array(CardSchema),
  workedExample: WorkedExampleSchema,
})

// Cases (Module 3 contract; validated, unused in v1)
export const CaseSchema = z.object({ id: z.string(), title: z.string() }).passthrough()
export const CasesSchema = z.array(CaseSchema)
