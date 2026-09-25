import { describe, expect, it } from 'vitest'
import { guidanceLists } from '../data/guidanceLists'
import { sources } from '../data/sources'
import type { GuidanceList } from '../domain/schemas'
import { buildContentIndex } from '../test/buildContentIndex'
import {
  buildCatalogueQuery,
  parseCatalogueQuery,
  parsePreparationSlug,
  withPreparationSlug,
} from './catalogueQuery'

const dairy = { id: 'dairy', slug: 'dairy', name: 'Dairy', parentId: null, aliases: [], sortOrder: 1 }
const raw = { id: 'raw', slug: 'raw', name: 'Raw', sortOrder: 1 }

const indexWith = (lists: GuidanceList[] = guidanceLists) =>
  buildContentIndex({ categories: [dairy], preparations: [raw], sources, guidanceLists: lists })

const index = indexWith()

describe('catalogue query', () => {
  it('defaults an absent scope to pregnancy and vegetarian suitability', () => {
    const parsed = parseCatalogueQuery(
      new URLSearchParams('v=1&q=hard%20cheese&category=dairy'),
      index,
    )

    expect(parsed).toEqual({
      state: {
        scopeSlugs: ['pregnancy-food-safety', 'vegetarian-suitability'],
        outcomeBands: [],
        query: 'hard cheese',
        categorySlug: 'dairy',
      },
      unavailableFiltersRemoved: false,
    })
  })

  it('parses and serialises selected scopes and generic outcome bands', () => {
    const alternativeList = {
      ...guidanceLists[0],
      id: 'alternative-food-safety',
      slug: 'alternative-food-safety',
    }
    const parsed = parseCatalogueQuery(
      new URLSearchParams('v=1&scope=alternative-food-safety,pregnancy-food-safety&q=hard%20cheese&category=dairy&outcome=not-okay,maybe'),
      indexWith([guidanceLists[0], alternativeList]),
    )

    expect(parsed.unavailableFiltersRemoved).toBe(false)
    expect(parsed.state).toEqual({
      scopeSlugs: ['alternative-food-safety', 'pregnancy-food-safety'],
      outcomeBands: ['not-okay', 'maybe'],
      query: 'hard cheese',
      categorySlug: 'dairy',
    })
    expect(buildCatalogueQuery(parsed.state, indexWith([guidanceLists[0], alternativeList])).toString()).toBe(
      'v=1&scope=pregnancy-food-safety%2Calternative-food-safety&q=hard+cheese&category=dairy&outcome=maybe%2Cnot-okay',
    )
  })

  it('keeps valid constraints while defaulting scopes from an unsupported URL version', () => {
    const parsed = parseCatalogueQuery(
      new URLSearchParams('v=2&scope=alternative-food-safety&q=brie&category=dairy&outcome=okay'),
      index,
    )

    expect(parsed).toEqual({
      state: {
        scopeSlugs: ['pregnancy-food-safety', 'vegetarian-suitability'],
        outcomeBands: [],
        query: 'brie',
        categorySlug: 'dairy',
      },
      unavailableFiltersRemoved: true,
    })
  })

  it('removes unknown and duplicate scopes and outcomes while retaining valid values', () => {
    const parsed = parseCatalogueQuery(
      new URLSearchParams('scope=pregnancy-food-safety,unknown,pregnancy-food-safety&outcome=okay,unknown,okay'),
      index,
    )

    expect(parsed).toEqual({
      state: {
        scopeSlugs: ['pregnancy-food-safety'],
        outcomeBands: ['okay'],
        query: '',
      },
      unavailableFiltersRemoved: true,
    })
  })

  it('drops the retired outside-coverage outcome and announces the removal', () => {
    const parsed = parseCatalogueQuery(
      new URLSearchParams('v=1&scope=pregnancy-food-safety&outcome=outside-coverage,not-assessed'),
      index,
    )

    expect(parsed).toEqual({
      state: {
        scopeSlugs: ['pregnancy-food-safety'],
        outcomeBands: ['not-assessed'],
        query: '',
      },
      unavailableFiltersRemoved: true,
    })
  })

  it('rejects the unreleased display-list URL contract', () => {
    const parsed = parseCatalogueQuery(
      new URLSearchParams('list=alternative-food-safety&status.alternative-food-safety=okay'),
      index,
    )

    expect(parsed).toEqual({
      state: {
        scopeSlugs: ['pregnancy-food-safety', 'vegetarian-suitability'],
        outcomeBands: [],
        query: '',
      },
      unavailableFiltersRemoved: true,
    })
  })

  it('uses the first available list when pregnancy guidance is not present', () => {
    const alternativeOnly = [{ ...guidanceLists[0], id: 'alternative-food-safety', slug: 'alternative-food-safety' }]

    expect(parseCatalogueQuery(
      new URLSearchParams(),
      indexWith(alternativeOnly),
    ).state.scopeSlugs).toEqual(['alternative-food-safety'])
  })
})

// ADR: Model catalogue subjects and preparation independently.
// See: docs/decisions/2026-09-21 ADR - model catalogue subjects and preparation independently.md
describe('the preparation a food page was opened in', () => {
  it('accepts a known preparation slug and strips an unknown one', () => {
    expect(parsePreparationSlug(new URLSearchParams('v=1&prep=raw'), index)).toBe('raw')
    expect(parsePreparationSlug(new URLSearchParams('v=1&prep=poached'), index)).toBeUndefined()
    expect(parsePreparationSlug(new URLSearchParams('v=1'), index)).toBeUndefined()
  })

  it('keeps the catalogue own canonical URL free of a preparation', () => {
    const search = buildCatalogueQuery(
      { scopeSlugs: ['pregnancy-food-safety'], outcomeBands: [], query: '' },
      index,
    ).toString()

    expect(search).not.toContain('prep')
    expect(withPreparationSlug(search, 'raw')).toContain('prep=raw')
    expect(withPreparationSlug(search)).toBe(search)
  })
})
