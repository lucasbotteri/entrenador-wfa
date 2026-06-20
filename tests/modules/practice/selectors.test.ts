import { describe, it, expect } from 'vitest'

import { validContent } from '../../fixtures/content.fixture'

import { getDueCards, getTopics } from '@/modules/practice/content/selectors'

describe('practice selectors', () => {
  it('getDueCards: no state = due', () => {
    expect(getDueCards(validContent.cards, {}, '2026-06-19').length).toBe(validContent.cards.length)
  })
  it('getTopics: distinct topics', () => {
    expect(getTopics(validContent.cards)).toEqual(expect.arrayContaining(['HABCDE', 'AVDN', 'Manejo']))
  })
})
