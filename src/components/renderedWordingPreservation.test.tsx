import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { contentIndex as index } from '../data'
import { assessmentSummary, resolveAssessment } from '../domain/assessment'
import { catalogueRows, categoryEntryRows } from '../domain/categoryTree'
import { GuidanceSection } from './GuidanceSection'
import { GuideEntrySummary } from './GuideEntrySummary'

/**
 * ADR: Resolve guidance conservatively without inference.
 * See: docs/decisions/2026-09-21 ADR - resolve guidance conservatively without inference.md
 *
 * The resolver keeping every authored layer is worth nothing if a view then shows a subset. This
 * walks every row the catalogue can render and asserts each authored summary actually reaches the
 * screen, in both the compact catalogue entry and the full detail section.
 *
 * It exists because a summary view once selected layers by their origin rather than rendering them
 * all, which silently hid every species mercury limit behind its group's cooking rule.
 */
describe('rendered guidance preserves every authored layer', () => {
  const rows = index.guidanceLists.flatMap((guidanceList) => [
    ...catalogueRows(index).map(({ food, preparationId }) => ({
      name: `${food.name} (${preparationId ?? 'no preparation'}) in ${guidanceList.title}`,
      guidanceList,
      resolved: resolveAssessment({ kind: 'food', food }, guidanceList, index, preparationId),
    })),
    ...categoryEntryRows(index)
      .map(({ category, preparationId }) => ({
        name: `${category.name} (${preparationId ?? 'no preparation'}) in ${guidanceList.title}`,
        guidanceList,
        resolved: resolveAssessment({ kind: 'category', category }, guidanceList, index, preparationId),
      })),
  ])

  it('covers every catalogue row', () => {
    expect(rows.length).toBeGreaterThan(400)
    expect(rows.some(({ resolved }) => resolved.layers.length > 1)).toBe(true)
  })

  it.each([
    ['catalogue entry', (row: (typeof rows)[number]) => (
      <GuideEntrySummary
        guidanceList={row.guidanceList}
        resolved={row.resolved}
        index={index}
        returnSearch=""
      />
    )],
    ['detail section', (row: (typeof rows)[number]) => (
      <GuidanceSection
        guidanceList={row.guidanceList}
        index={index}
        resolved={row.resolved}
        returnSearch=""
      />
    )],
  ])('states every authored layer in the %s', (_view, renderRow) => {
    for (const row of rows) {
      const { unmount } = render(<MemoryRouter>{renderRow(row)}</MemoryRouter>)

      for (const layer of row.resolved.layers) {
        const authored = assessmentSummary(layer.assessment, row.guidanceList)
        expect(document.body.textContent, `${row.name} does not state "${authored}"`).toContain(authored)
      }

      unmount()
    }
  }, 15_000)
})
