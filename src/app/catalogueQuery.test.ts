import { describe, expect, it } from 'vitest'
import { categories } from '../data/categories'
import { guidanceLists } from '../data/guidanceLists'
import { buildCatalogueQuery, parseCatalogueQuery } from './catalogueQuery'

describe('catalogue query', () => {
  it('defaults an absent scope to pregnancy food safety', () => {
    const parsed = parseCatalogueQuery(
      new URLSearchParams('v=1&q=hard%20cheese&category=dairy'),
      guidanceLists,
      new Set(categories.map((category) => category.slug)),
    )

    expect(parsed).toEqual({
      state: {
        scopeSlugs: ['pregnancy-food-safety'],
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
      [guidanceLists[0], alternativeList],
      new Set(categories.map((category) => category.slug)),
    )

    expect(parsed.unavailableFiltersRemoved).toBe(false)
    expect(parsed.state).toEqual({
      scopeSlugs: ['alternative-food-safety', 'pregnancy-food-safety'],
      outcomeBands: ['not-okay', 'maybe'],
      query: 'hard cheese',
      categorySlug: 'dairy',
    })
    expect(buildCatalogueQuery(parsed.state, [guidanceLists[0], alternativeList]).toString()).toBe(
      'v=1&scope=pregnancy-food-safety%2Calternative-food-safety&q=hard+cheese&category=dairy&outcome=maybe%2Cnot-okay',
    )
  })

  it('keeps valid constraints while defaulting scopes from an unsupported URL version', () => {
    const parsed = parseCatalogueQuery(
      new URLSearchParams('v=2&scope=alternative-food-safety&q=brie&category=dairy&outcome=okay'),
      guidanceLists,
      new Set(categories.map((category) => category.slug)),
    )

    expect(parsed).toEqual({
      state: {
        scopeSlugs: ['pregnancy-food-safety'],
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
      guidanceLists,
      new Set(categories.map((category) => category.slug)),
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

  it('rejects the unreleased display-list URL contract', () => {
    const parsed = parseCatalogueQuery(
      new URLSearchParams('list=alternative-food-safety&status.alternative-food-safety=okay'),
      guidanceLists,
      new Set(categories.map((category) => category.slug)),
    )

    expect(parsed).toEqual({
      state: {
        scopeSlugs: ['pregnancy-food-safety'],
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
      alternativeOnly,
      new Set(categories.map((category) => category.slug)),
    ).state.scopeSlugs).toEqual(['alternative-food-safety'])
  })
})
