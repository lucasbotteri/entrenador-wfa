import { z } from 'zod'

import {
  AcronymSchema,
  AcronymLetterSchema,
  AcronymComponentSchema,
  ChainPhaseSchema,
  ContentSchema,
  CasesSchema,
  EvacLevelSchema,
  PracticalRuleSchema,
  ClinicalTopicSchema,
  CardSchema,
  WorkedExampleSchema,
  WorkedExampleStepSchema,
  PhaseIdSchema,
} from './schemas'

export type Acronym = z.infer<typeof AcronymSchema>
export type AcronymLetter = z.infer<typeof AcronymLetterSchema>
export type AcronymComponent = z.infer<typeof AcronymComponentSchema>
export type ChainPhaseRaw = z.infer<typeof ChainPhaseSchema>
export type Content = z.infer<typeof ContentSchema>
export type Cases = z.infer<typeof CasesSchema>
export type EvacLevel = z.infer<typeof EvacLevelSchema>
export type PracticalRule = z.infer<typeof PracticalRuleSchema>
export type ClinicalTopic = z.infer<typeof ClinicalTopicSchema>
export type Card = z.infer<typeof CardSchema>
export type WorkedExample = z.infer<typeof WorkedExampleSchema>
export type WorkedExampleStep = z.infer<typeof WorkedExampleStepSchema>
export type PhaseId = z.infer<typeof PhaseIdSchema>
