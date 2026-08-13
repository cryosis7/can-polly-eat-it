import { describe, expect, it } from 'vitest'
import {
  combineOutcomesAcrossLists,
  combinedOutcomePresentation,
  summariseCollapsedRow,
  type CombinedOutcome,
} from './collapsedRowSummary'

describe('combineOutcomesAcrossLists', () => {
  it('returns not-okay when any active list says not-okay', () => {
    expect(combineOutcomesAcrossLists(['okay', 'not-okay'])).toBe('not-okay')
    expect(combineOutcomesAcrossLists(['not-assessed', 'not-okay'])).toBe('not-okay')
    expect(combineOutcomesAcrossLists(['maybe', 'not-okay'])).toBe('not-okay')
  })

  it('prefers not-okay over maybe, so caution is never diluted by ordering', () => {
    expect(combineOutcomesAcrossLists(['not-okay', 'maybe'])).toBe('not-okay')
    expect(combineOutcomesAcrossLists(['maybe', 'not-okay', 'okay'])).toBe('not-okay')
  })

  it('returns maybe when any active list says maybe and none says not-okay', () => {
    expect(combineOutcomesAcrossLists(['okay', 'maybe'])).toBe('maybe')
    expect(combineOutcomesAcrossLists(['maybe'])).toBe('maybe')
  })

  it('treats an unassessed list as a caution when another list has a real answer', () => {
    expect(combineOutcomesAcrossLists(['okay', 'not-assessed'])).toBe('maybe')
    expect(combineOutcomesAcrossLists(['not-assessed', 'okay'])).toBe('maybe')
  })

  it('never lets silence on one list read as okay, so unreviewed content is not presented as safe', () => {
    // Alcohol carries no pregnancy assessment in the current content. A vegetarian "okay" must not
    // combine with that silence to say the drink is fine.
    expect(combineOutcomesAcrossLists(['okay', 'not-assessed'])).not.toBe('okay')
  })

  it('returns okay only when every active list says okay', () => {
    expect(combineOutcomesAcrossLists(['okay'])).toBe('okay')
    expect(combineOutcomesAcrossLists(['okay', 'okay', 'okay'])).toBe('okay')
  })

  it('returns not-assessed when every active list is silent', () => {
    expect(combineOutcomesAcrossLists(['not-assessed'])).toBe('not-assessed')
    expect(combineOutcomesAcrossLists(['not-assessed', 'not-assessed'])).toBe('not-assessed')
  })

  it('returns not-assessed rather than maybe when nothing has been assessed at all', () => {
    expect(combineOutcomesAcrossLists(['not-assessed', 'not-assessed'])).not.toBe('maybe')
  })

  it('returns not-assessed for an empty list selection', () => {
    expect(combineOutcomesAcrossLists([])).toBe('not-assessed')
  })
})

describe('summariseCollapsedRow', () => {
  it('returns the shared outcome when every entry agrees', () => {
    expect(summariseCollapsedRow(['okay', 'okay', 'okay'])).toBe('okay')
    expect(summariseCollapsedRow(['not-okay', 'not-okay'])).toBe('not-okay')
    expect(summariseCollapsedRow(['maybe', 'maybe'])).toBe('maybe')
    expect(summariseCollapsedRow(['not-assessed', 'not-assessed'])).toBe('not-assessed')
  })

  it('returns maybe when a single entry dissents', () => {
    // Cereals: the category rule and three foods say okay, Fresh filled pasta replaces it.
    expect(summariseCollapsedRow(['okay', 'okay', 'okay', 'okay', 'maybe'])).toBe('maybe')
  })

  it('returns maybe rather than the most cautious outcome present, because it checks agreement', () => {
    expect(summariseCollapsedRow(['okay', 'not-okay'])).toBe('maybe')
    expect(summariseCollapsedRow(['not-assessed', 'maybe', 'not-okay'])).toBe('maybe')
  })

  it('summarises a single-entry row as that entry', () => {
    expect(summariseCollapsedRow(['not-okay'])).toBe('not-okay')
  })

  it('returns undefined when there is nothing to summarise', () => {
    expect(summariseCollapsedRow([])).toBeUndefined()
  })

  it('conflates a uniformly maybe row with a mixed one, as accepted', () => {
    expect(summariseCollapsedRow(['maybe', 'maybe'])).toBe('maybe')
    expect(summariseCollapsedRow(['okay', 'not-okay'])).toBe('maybe')
  })
})

describe('combinedOutcomePresentation', () => {
  it('gives every combined outcome a tone, a glyph, and a single word', () => {
    const outcomes: CombinedOutcome[] = ['okay', 'maybe', 'not-okay', 'not-assessed']
    for (const outcome of outcomes) {
      const { tone, icon, label } = combinedOutcomePresentation[outcome]
      expect(tone).toBeTruthy()
      expect(icon).toBeTruthy()
      expect(label.trim().split(/\s+/)).toHaveLength(1)
    }
  })

  it('uses a vocabulary distinct from any authored status label', () => {
    expect(combinedOutcomePresentation.okay.label).toBe('OK')
    expect(combinedOutcomePresentation.maybe.label).toBe('Maybe')
    expect(combinedOutcomePresentation['not-okay'].label).toBe('Avoid')
    expect(combinedOutcomePresentation['not-assessed'].label).toBe('Unknown')
  })
})
