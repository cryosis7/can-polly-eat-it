import { describe, expect, it } from 'vitest'
import {
  categoryAssessment,
  dualSourceContent,
  dualSourceList,
  fixturePreparations,
  makeFood,
  nzfs,
} from '../test/multiSourceFixture'
import { categoryEntryRows, entryRowsByCategoryId, preparationIdsByCategoryId } from './categoryTree'
import { buildContentIndex } from '../test/buildContentIndex'
import { filterCategoryEntries } from './filtering'

/**
 * A category is a first-class subject, so once its preparation-shaped children retire onto it its
 * guidance has the same two axes a food's does. These cover the category side of that: deriving the
 * axes a category holds, filtering per axis, and never collapsing qualified guidance into a single
 * preparation-free answer.
 */

const rawShellfish = categoryAssessment('shellfish-raw', 'shellfish', 'dual-avoid', {
  preparationId: 'raw',
  sourceId: nzfs.id,
  summary: 'Do not eat raw shellfish.',
})
const cookedShellfish = categoryAssessment('shellfish-cooked', 'shellfish', 'dual-conditions', {
  preparationId: 'cooked',
  sourceId: nzfs.id,
  summary: 'Cook shellfish thoroughly and eat it while hot.',
})
const shellfishWide = categoryAssessment('shellfish-wide', 'shellfish', 'dual-ok', {
  sourceId: nzfs.id,
  summary: 'Shellfish is okay to eat.',
})

const noFilters = { query: '', guidanceListIds: [], outcomeBands: [] }

const entriesFor = (content: ReturnType<typeof dualSourceContent>) => filterCategoryEntries(
  content.categories,
  content.assessments,
  content.preparations,
  content.guidanceLists,
  buildContentIndex(content),
  noFilters,
)

describe('category guidance entries across preparations', () => {
  it('yields one row per axis a category holds guidance on, in vocabulary order', () => {
    const rows = categoryEntryRows(
      [{ id: 'shellfish', slug: 'shellfish', name: 'Shellfish', parentId: 'seafood', aliases: [], sortOrder: 1 }],
      [cookedShellfish, shellfishWide, rawShellfish],
      fixturePreparations,
    )

    expect(rows.map((row) => row.preparationId)).toEqual([undefined, 'raw', 'cooked'])
  })

  it('yields no rows for a category carrying no assessment of its own', () => {
    expect(categoryEntryRows(
      [{ id: 'seafood', slug: 'seafood', name: 'Seafood', parentId: null, aliases: [], sortOrder: 1 }],
      [rawShellfish],
      fixturePreparations,
    )).toEqual([])
  })

  it('returns a row per preparation the category is assessed for', () => {
    const content = dualSourceContent([rawShellfish, cookedShellfish], [])

    expect(entriesFor(content).map((row) => `${row.category.id}:${row.preparationId}`))
      .toEqual(['shellfish:raw', 'shellfish:cooked'])
  })

  it('matches an outcome filter on the raw entry without matching the cooked entry', () => {
    const content = dualSourceContent([rawShellfish, cookedShellfish], [])
    const index = buildContentIndex(content)

    const notOkay = filterCategoryEntries(
      content.categories,
      content.assessments,
      content.preparations,
      content.guidanceLists,
      index,
      { ...noFilters, guidanceListIds: [dualSourceList.id], outcomeBands: ['not-okay'] },
    )

    expect(notOkay.map((row) => row.preparationId)).toEqual(['raw'])
  })

  it('derives a category grouping for a preparation only its own assessment carries', () => {
    const groupings = preparationIdsByCategoryId(
      [makeFood('paua')],
      [rawShellfish, cookedShellfish],
      fixturePreparations,
    )

    expect(groupings.get('shellfish')).toEqual(['raw', 'cooked'])
  })

  it('groups entry rows under their category in vocabulary order', () => {
    const content = dualSourceContent([cookedShellfish, shellfishWide, rawShellfish], [])
    const grouped = entryRowsByCategoryId(
      entriesFor(content),
      preparationIdsByCategoryId([], content.assessments, content.preparations),
    )

    expect([...grouped.get('shellfish')!.keys()]).toEqual([undefined, 'raw', 'cooked'])
  })

  it('keeps each preparation entry countable once', () => {
    const content = dualSourceContent([rawShellfish, cookedShellfish, shellfishWide], [])

    expect(entriesFor(content)).toHaveLength(3)
  })
})
