import casesJson from './generated/cases.json'
import contentJson from './generated/content.json'
import { ContentSchema, CasesSchema } from './schemas'
import type { Content, Cases } from './types'

let cachedContent: Content | null = null
let cachedCases: Cases | null = null

export function loadContent(): Content {
  if (!cachedContent) cachedContent = ContentSchema.parse(contentJson)
  return cachedContent
}

export function loadCases(): Cases {
  if (!cachedCases) cachedCases = CasesSchema.parse(casesJson)
  return cachedCases
}
