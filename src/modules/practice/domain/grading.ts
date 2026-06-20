import type { Card } from '@/shared/content/types'

export type UserAnswer = string | string[]
export interface GradeResult {
  correct: boolean
  correctText: string
}

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '') // strip diacritics (portable unicode property escape)
    .replace(/[^\p{L}\p{N}\s]/gu, ' ') // strip punctuation
    .replace(/\s+/g, ' ')
    .trim()
}

function tokens(s: string): string[] {
  return normalize(s).split(' ').filter(Boolean)
}

function gradeWrite(card: Card, input: string): boolean {
  const n = normalize(input)
  return card.answer.some(ans => {
    const na = normalize(ans)
    if (n === na) return true
    const at = tokens(ans)
    if (at.length > 1) {
      const inSet = new Set(tokens(input))
      return at.every(t => inSet.has(t))
    }
    return false
  })
}

export function grade(card: Card, userAnswer: UserAnswer): GradeResult {
  switch (card.type) {
    case 'ordenar': {
      const ua = userAnswer as string[]
      const correct = ua.length === card.answer.length && ua.every((v, i) => v === card.answer[i])
      return { correct, correctText: card.answer.join(' → ') }
    }
    case 'cloze': {
      const ua = userAnswer as string[]
      const correct =
        ua.length === card.answer.length && ua.every((v, i) => normalize(v) === normalize(card.answer[i]!))
      return { correct, correctText: card.answer.join(', ') }
    }
    case 'elegir': {
      return { correct: (userAnswer as string) === card.answer[0], correctText: card.answer[0]! }
    }
    case 'escribir':
    default: {
      return { correct: gradeWrite(card, userAnswer as string), correctText: card.answer[0]! }
    }
  }
}
