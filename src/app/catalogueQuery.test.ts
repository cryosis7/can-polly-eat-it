import { describe, expect, it } from 'vitest'
import { categories } from '../data/categories'
import { guidanceLists } from '../data/guidanceLists'
import { buildCatalogueQuery, parseCatalogueQuery } from './catalogueQuery'

describe('catalogue query', () => {
  it('parses and serialises the versioned URL contract', () => {
    const parsed = parseCatalogueQuery(
      new URLSearchParams('v=1&list=pregnancy-food-safety&q=hard%20cheese&category=dairy&status.pregnancy-food-safety=avoid,only-with-conditions'),
      guidanceLists,
      new Set(categories.map((category) => category.slug)),
    )

    expect(parsed.unavailableFiltersRemoved).toBe(false)
    expect(parsed.state).toEqual({
      displayListSlug: 'pregnancy-food-safety',
      query: 'hard cheese',
      categorySlug: 'dairy',
      statusSlugsByListSlug: {
        'pregnancy-food-safety': ['avoid', 'only-with-conditions'],
      },
    })
    expect(buildCatalogueQuery(parsed.state, guidanceLists).toString()).toBe(
      'v=1&list=pregnancy-food-safety&q=hard+cheese&category=dairy&status.pregnancy-food-safety=only-with-conditions%2Cavoid',
    )
  })

  it('keeps valid constraints while falling back from unavailable shared values', () => {
    const parsed = parseCatalogueQuery(
      new URLSearchParams('v=2&list=retired-list&q=brie&category=dairy&status.retired-list=avoid&status.pregnancy-food-safety=avoid'),
      guidanceLists,
      new Set(categories.map((category) => category.slug)),
    )

    expect(parsed.unavailableFiltersRemoved).toBe(true)
    expect(parsed.state).toEqual({
      displayListSlug: 'pregnancy-food-safety',
      query: 'brie',
      categorySlug: 'dairy',
      statusSlugsByListSlug: {
        'pregnancy-food-safety': ['avoid'],
      },
    })
  })
})
