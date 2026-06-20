import { describe, it, expect } from 'vitest'

import { parseCloze } from '@/modules/practice/domain/cloze'

describe('parseCloze', () => {
  it('splits {{...}} into segments + blank count', () => {
    const r = parseCloze('A {{x}}, B {{y}}, C')
    expect(r.blanks).toBe(2)
    expect(r.segments).toEqual(['A ', ', B ', ', C'])
  })
})
