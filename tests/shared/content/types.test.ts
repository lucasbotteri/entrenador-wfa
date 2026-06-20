import { describe, it, expectTypeOf } from 'vitest'

import type { Content, Acronym, PhaseId } from '@/shared/content/types'

describe('content types', () => {
  it('Content has the expected shape', () => {
    expectTypeOf<Content['acronyms']>().toMatchTypeOf<Acronym[]>()
    expectTypeOf<PhaseId>().toEqualTypeOf<'scene' | 'primary' | 'secondary' | 'evacuation'>()
  })
})
