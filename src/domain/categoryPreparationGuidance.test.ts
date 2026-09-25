import { describe, expect, it } from 'vitest'
import {
  categoryAssessment,
  dualSourceContent,
  dualSourceList,
  makeFood,
  nzfs,
} from '../test/multiSourceFixture'
import { listCatalogue } from './catalogueListing'
import { categoryEntryRows } from './categoryTree'
import { buildContentIndex } from '../test/buildContentIndex'
import { initialCollapseState, toggleCategory } from './collapseState'
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

const entriesFor = (content: ReturnType<typeof dualSourceContent>) => filterCategoryEntries(buildContentIndex(content), noFilters)

const entryRowsOf = (categoryId: string, content: ReturnType<typeof dualSourceContent>) =>
  categoryEntryRows(buildContentIndex(content)).filter((row) => row.category.id === categoryId)

describe('category guidance entries across preparations', () => {
  it('yields one row per axis a category holds guidance on, in vocabulary order', () => {
    const rows = entryRowsOf('shellfish', dualSourceContent([cookedShellfish, shellfishWide, rawShellfish]))

    expect(rows.map((row) => row.preparationId)).toEqual([undefined, 'raw', 'cooked'])
  })

  it('yields no rows for a category carrying no assessment of its own', () => {
    expect(entryRowsOf('seafood', dualSourceContent([rawShellfish]))).toEqual([])
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
      index,
      { ...noFilters, guidanceListIds: [dualSourceList.id], outcomeBands: ['not-okay'] },
    )

    expect(notOkay.map((row) => row.preparationId)).toEqual(['raw'])
  })

  it('derives a category grouping for a preparation only its own assessment carries', () => {
    const index = buildContentIndex(dualSourceContent([rawShellfish, cookedShellfish], [makeFood('paua')]))

    expect(index.preparationStatesFor('shellfish').map((preparation) => preparation.id)).toEqual(['raw', 'cooked'])
  })

  it('lists the unqualified entry on its category and each qualified entry as a band, in vocabulary order', () => {
    const index = buildContentIndex(dualSourceContent([cookedShellfish, shellfishWide, rawShellfish], []))
    const filters = { ...noFilters, guidanceListIds: [dualSourceList.id] }

    const shellfish = listCatalogue(index, filters, toggleCategory(initialCollapseState(index), 'seafood', filters))
      .sections.find((section) => section.category.id === 'shellfish')!

    expect(shellfish.ownEntry).toBeDefined()
    expect(shellfish.bands.map((band) => [band.preparation.id, band.hasOwnEntry])).toEqual([['raw', true], ['cooked', true]])
  })

  it('keeps each preparation entry countable once', () => {
    const content = dualSourceContent([rawShellfish, cookedShellfish, shellfishWide], [])

    expect(entriesFor(content)).toHaveLength(3)
  })
})
