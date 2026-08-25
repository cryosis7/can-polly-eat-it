import { describe, expect, it } from 'vitest'
import { categories } from '../data/categories'
import { guidanceLists } from '../data/guidanceLists'
import { preparations } from '../data/preparations'
import {
  buildCatalogueQuery,
  parseCatalogueQuery,
  parsePreparationSlug,
  withPreparationSlug,
} from './catalogueQuery'

describe('catalogue query', () => {
  it('defaults an absent scope to pregnancy and vegetarian suitability', () => {
    const parsed = parseCatalogueQuery(
      new URLSearchParams('v=1&q=hard%20cheese&category=dairy'),
      guidanceLists,
      new Set(categories.map((category) => category.slug)),
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

  it('drops the retired outside-coverage outcome and announces the removal', () => {
    const parsed = parseCatalogueQuery(
      new URLSearchParams('v=1&scope=pregnancy-food-safety&outcome=outside-coverage,not-assessed'),
      guidanceLists,
      new Set(categories.map((category) => category.slug)),
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
      guidanceLists,
      new Set(categories.map((category) => category.slug)),
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
      alternativeOnly,
      new Set(categories.map((category) => category.slug)),
    ).state.scopeSlugs).toEqual(['alternative-food-safety'])
  })
})

// ADR: Model preparation as a catalogue dimension.
// See: docs/decisions/2026-08-10 ADR - model preparation as a catalogue dimension.md
describe('the preparation a food page was opened in', () => {
  it('accepts a known preparation slug and strips an unknown one', () => {
    expect(parsePreparationSlug(new URLSearchParams('v=1&prep=raw'), preparations)).toBe('raw')
    expect(parsePreparationSlug(new URLSearchParams('v=1&prep=poached'), preparations)).toBeUndefined()
    expect(parsePreparationSlug(new URLSearchParams('v=1'), preparations)).toBeUndefined()
  })

  it('keeps the catalogue own canonical URL free of a preparation', () => {
    const search = buildCatalogueQuery(
      { scopeSlugs: ['pregnancy-food-safety'], outcomeBands: [], query: '' },
      guidanceLists,
    ).toString()

    expect(search).not.toContain('prep')
    expect(withPreparationSlug(search, 'raw')).toContain('prep=raw')
    expect(withPreparationSlug(search)).toBe(search)
  })
})
