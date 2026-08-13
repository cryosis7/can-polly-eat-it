import type { OutcomeBand } from './schemas'

// ADR: Derive a display-only combined outcome for collapsed-row summaries.
// See: docs/decisions/2026-08-13 ADR - derive a display-only combined outcome for collapsed-row summaries.md
/**
 * The summary shown on a collapsed row. It is deliberately not a `StatusDefinition`: no guidance
 * list authored it, it is never persisted, and it disappears the moment the row is expanded and the
 * real per-list statuses become visible. Only the generic `outcomeBand` is ever combined; authored
 * summaries, scope statements, scenarios, conditions, citations, and sources are never touched.
 */
export type CombinedOutcome = Extract<OutcomeBand, 'okay' | 'maybe' | 'not-okay' | 'not-assessed'>

/**
 * One subject's outcome across every active guidance list, most cautious first.
 *
 * `not-assessed` mixed with any real answer yields `maybe` rather than deferring to the real one. A
 * subject is unassessed because nobody has reviewed it yet, which is not evidence that it is fine,
 * so combining `okay` with silence down to `okay` would manufacture an assurance no authority gave.
 * Alcohol is the worked case: it carries no pregnancy assessment in the current content, and no
 * combination may present it as okay on the strength of another list's silence.
 *
 * Only when every active list is silent does the subject stay `not-assessed`, because then there is
 * nothing to caution against and nothing assessed either.
 */
export const combineOutcomesAcrossLists = (bands: OutcomeBand[]): CombinedOutcome => {
  if (bands.some((band) => band === 'not-okay')) {
    return 'not-okay'
  }
  if (bands.some((band) => band === 'maybe')) {
    return 'maybe'
  }
  const assessed = bands.filter((band) => band !== 'not-assessed')
  if (assessed.length === 0) {
    return 'not-assessed'
  }
  return assessed.length === bands.length ? 'okay' : 'maybe'
}

// ADR: Derive a display-only combined outcome for collapsed-row summaries.
// See: docs/decisions/2026-08-13 ADR - derive a display-only combined outcome for collapsed-row summaries.md
/**
 * The chip for a collapsed row, folded over every entry the collapse hides: the row's own guidance
 * entry where it has one, and every descendant food and category entry.
 *
 * The row's own rule participates as a peer entry rather than being merged into its descendants,
 * because inheritance and additive stacking are already resolved per entry before this runs. A
 * descendant that replaces its ancestor's rule therefore disagrees with it here, and one dissenter
 * is enough to make the row read `maybe`.
 *
 * This is a uniformity check, not a second most-cautious pass: a row holding both `okay` and
 * `not-okay` entries reads `maybe`, meaning "mixed, open it", not `not-okay`. A row whose entries
 * are uniformly `maybe` is therefore indistinguishable from a mixed one. That conflation is
 * accepted: both correctly tell the reader the group needs their attention.
 *
 * An empty set has nothing to summarise and yields `undefined`, so no chip renders.
 */
export const summariseCollapsedRow = (entryOutcomes: CombinedOutcome[]): CombinedOutcome | undefined => {
  if (entryOutcomes.length === 0) {
    return undefined
  }
  const [first] = entryOutcomes
  return entryOutcomes.every((outcome) => outcome === first) ? first : 'maybe'
}

/** The tone, glyph, and single word a combined outcome renders as. */
export const combinedOutcomePresentation: Record<CombinedOutcome, { tone: string, icon: string, label: string }> = {
  okay: { tone: 'green', icon: '✓', label: 'OK' },
  maybe: { tone: 'amber', icon: '⚠', label: 'Maybe' },
  'not-okay': { tone: 'red', icon: '✕', label: 'Avoid' },
  'not-assessed': { tone: 'grey', icon: '?', label: 'Unknown' },
}

/**
 * The spoken form of a chip, for the row control's accessible name. The chip itself is hidden from
 * assistive technology, so this is where the summary reaches a screen reader, and it says what the
 * chip means rather than repeating its one-word shorthand out of context.
 */
export const combinedOutcomeLabel: Record<CombinedOutcome, string> = {
  okay: 'all okay',
  maybe: 'mixed or conditional, open to see details',
  'not-okay': 'all avoid',
  'not-assessed': 'none assessed',
}
