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
