import { describe, expect, it } from 'vitest'
import { contentIndex as index } from '../data'
import {
  collapsedCategoryIds,
  initialCollapseState,
  isBandCollapsed,
  isCategoryCollapsed,
  isFiltering,
  isSameFilter,
  preparationBandKey,
  settleCollapseState,
  toggleBand,
  toggleCategory,
} from './collapseState'
import type { FoodFilterState } from './filtering'

const browsing: FoodFilterState = {
  query: '',
  guidanceListIds: ['pregnancy-food-safety'],
  outcomeBands: [],
}
const searchingRice: FoodFilterState = { ...browsing, query: 'rice' }

describe('isFiltering', () => {
  it('treats a search, category, or outcome filter as filtering', () => {
    expect(isFiltering(searchingRice)).toBe(true)
    expect(isFiltering({ ...browsing, categoryId: 'dairy' })).toBe(true)
    expect(isFiltering({ ...browsing, outcomeBands: ['okay'] })).toBe(true)
  })

  it('does not treat selected dietary scopes alone as filtering', () => {
    expect(isFiltering(browsing)).toBe(false)
    expect(isFiltering({ ...browsing, guidanceListIds: ['pregnancy-food-safety', 'vegetarian-suitability'] })).toBe(false)
  })
})

describe('isSameFilter', () => {
  it('ignores the order of dietary scopes and outcomes', () => {
    expect(isSameFilter(
      { ...searchingRice, guidanceListIds: ['pregnancy-food-safety', 'vegetarian-suitability'], outcomeBands: ['okay', 'maybe'] },
      { ...searchingRice, guidanceListIds: ['vegetarian-suitability', 'pregnancy-food-safety'], outcomeBands: ['maybe', 'okay'] },
    )).toBe(true)
  })

  it.each<[string, FoodFilterState]>([
    ['search text', { ...searchingRice, query: 'rices' }],
    ['category', { ...searchingRice, categoryId: 'dairy' }],
    ['outcomes', { ...searchingRice, outcomeBands: ['okay'] }],
    ['selected scopes', { ...searchingRice, guidanceListIds: ['pregnancy-food-safety', 'vegetarian-suitability'] }],
  ])('tells filters apart by their %s', (_field, changed) => {
    expect(isSameFilter(searchingRice, changed)).toBe(false)
  })
})

describe('collapse state', () => {
  const rootIds = index.categories.filter((category) => category.parentId === null).map((category) => category.id)

  it('collapses every root category while browsing, and nothing while filtering, by default', () => {
    const state = initialCollapseState(index)

    expect([...collapsedCategoryIds(state, browsing)]).toEqual(rootIds)
    expect(collapsedCategoryIds(state, searchingRice).size).toBe(0)
  })

  it('toggles only the browse part while browsing', () => {
    const state = toggleCategory(initialCollapseState(index), 'drinks', browsing)

    expect(isCategoryCollapsed(state, 'drinks', browsing)).toBe(false)
    expect(isCategoryCollapsed(state, 'dairy', browsing)).toBe(true)
    expect(state.search).toBe(initialCollapseState(index).search)
  })

  it('toggles only the search part while filtering, and toggles it back', () => {
    const initial = initialCollapseState(index)
    const collapsed = toggleCategory(initial, 'drinks', searchingRice)

    expect(isCategoryCollapsed(collapsed, 'drinks', searchingRice)).toBe(true)
    expect(collapsed.browse).toBe(initial.browse)
    expect(isCategoryCollapsed(toggleCategory(collapsed, 'drinks', searchingRice), 'drinks', searchingRice)).toBe(false)
  })

  it('restores the browse part exactly when the filters clear', () => {
    const browsed = toggleCategory(initialCollapseState(index), 'dairy', browsing)
    const searched = toggleCategory(toggleCategory(browsed, 'drinks', searchingRice), 'dairy', searchingRice)

    expect(collapsedCategoryIds(searched, browsing)).toEqual(collapsedCategoryIds(browsed, browsing))
  })

  it.each<[string, FoodFilterState]>([
    ['search text', { ...searchingRice, query: 'rices' }],
    ['category', { ...searchingRice, categoryId: 'drinks' }],
    ['outcomes', { ...searchingRice, outcomeBands: ['okay'] }],
    ['selected scopes', { ...searchingRice, guidanceListIds: ['pregnancy-food-safety', 'vegetarian-suitability'] }],
  ])('ignores a search collapse once the %s changes', (_field, changed) => {
    const state = toggleCategory(initialCollapseState(index), 'drinks', searchingRice)

    expect(collapsedCategoryIds(state, changed).size).toBe(0)
  })

  it('keeps a search collapse when only the order of scopes or outcomes differs', () => {
    const madeUnder: FoodFilterState = { ...searchingRice, guidanceListIds: ['pregnancy-food-safety', 'vegetarian-suitability'], outcomeBands: ['okay', 'maybe'] }
    const reordered: FoodFilterState = { ...searchingRice, guidanceListIds: ['vegetarian-suitability', 'pregnancy-food-safety'], outcomeBands: ['maybe', 'okay'] }
    const state = toggleCategory(initialCollapseState(index), 'drinks', madeUnder)

    expect(isCategoryCollapsed(state, 'drinks', reordered)).toBe(true)
    expect(settleCollapseState(state, reordered)).toBe(state)
  })

  it('starts a toggle under a new filter from an open search part', () => {
    const changed: FoodFilterState = { ...searchingRice, query: 'tea' }
    const state = toggleCategory(toggleCategory(initialCollapseState(index), 'drinks', searchingRice), 'dairy', changed)

    expect([...collapsedCategoryIds(state, changed)]).toEqual(['dairy'])
    expect(state.search.filter).toBe(changed)
  })

  it('discards a search collapse on settling under another filter, so returning to its filter opens every group', () => {
    const state = toggleCategory(initialCollapseState(index), 'drinks', searchingRice)

    const settled = settleCollapseState(state, browsing)

    expect(settled.browse).toBe(state.browse)
    expect(isCategoryCollapsed(settled, 'drinks', searchingRice)).toBe(false)
    expect(settleCollapseState(settled, searchingRice)).toBe(settled)
  })

  it('leaves the state untouched on settling under the filter it was made under', () => {
    const state = toggleCategory(initialCollapseState(index), 'drinks', searchingRice)

    expect(settleCollapseState(state, searchingRice)).toBe(state)
    expect(settleCollapseState(initialCollapseState(index), searchingRice).search.filter).toBeUndefined()
  })
})

describe('preparation band collapse', () => {
  const smokedFish = preparationBandKey('fish', 'smoked')
  const rawFish = preparationBandKey('fish', 'raw')

  it('issues one stable key per category and preparation', () => {
    expect(preparationBandKey('fish', 'smoked')).toBe(smokedFish)
    expect(new Set([smokedFish, rawFish, preparationBandKey('shellfish', 'smoked')]).size).toBe(3)
  })

  it('collapses every band while browsing, and none while filtering, by default', () => {
    const state = initialCollapseState(index)

    expect(isBandCollapsed(state, smokedFish, browsing)).toBe(true)
    expect(isBandCollapsed(state, smokedFish, searchingRice)).toBe(false)
  })

  it('expands a band in the browse part only while browsing', () => {
    const initial = initialCollapseState(index)
    const state = toggleBand(initial, smokedFish, browsing)

    expect(isBandCollapsed(state, smokedFish, browsing)).toBe(false)
    expect(isBandCollapsed(state, rawFish, browsing)).toBe(true)
    expect(state.search).toBe(initial.search)
    expect(isBandCollapsed(toggleBand(state, smokedFish, browsing), smokedFish, browsing)).toBe(true)
  })

  it('collapses a band in the search part only while filtering, and restores the browse part when the filters clear', () => {
    const browsed = toggleBand(initialCollapseState(index), smokedFish, browsing)
    const searched = toggleBand(toggleBand(browsed, smokedFish, searchingRice), rawFish, searchingRice)

    expect(isBandCollapsed(searched, smokedFish, searchingRice)).toBe(true)
    expect(isBandCollapsed(searched, rawFish, searchingRice)).toBe(true)
    expect(searched.browse).toBe(browsed.browse)
    expect(isBandCollapsed(toggleBand(searched, rawFish, searchingRice), rawFish, searchingRice)).toBe(false)
    expect(isBandCollapsed(searched, smokedFish, browsing)).toBe(false)
    expect(isBandCollapsed(searched, rawFish, browsing)).toBe(true)
  })

  it.each<[string, FoodFilterState]>([
    ['search text', { ...searchingRice, query: 'rices' }],
    ['category', { ...searchingRice, categoryId: 'fish' }],
    ['outcomes', { ...searchingRice, outcomeBands: ['okay'] }],
    ['selected scopes', { ...searchingRice, guidanceListIds: ['pregnancy-food-safety', 'vegetarian-suitability'] }],
  ])('ignores a band search collapse once the %s changes', (_field, changed) => {
    const state = toggleBand(initialCollapseState(index), smokedFish, searchingRice)

    expect(isBandCollapsed(state, smokedFish, changed)).toBe(false)
    expect(isBandCollapsed(settleCollapseState(state, changed), smokedFish, searchingRice)).toBe(false)
  })

  it('starts a band toggle under a new filter from an open search part', () => {
    const changed: FoodFilterState = { ...searchingRice, query: 'fish' }
    const state = toggleBand(toggleCategory(initialCollapseState(index), 'drinks', searchingRice), rawFish, changed)

    expect(isBandCollapsed(state, rawFish, changed)).toBe(true)
    expect(isCategoryCollapsed(state, 'drinks', changed)).toBe(false)
  })
})