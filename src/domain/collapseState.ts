import type { ContentIndex } from './contentIndex'
import type { FoodFilterState } from './filtering'

/**
 * A reader's collapse state has two parts. The browse part is what they left while browsing. The
 * search part is a collapse made while filtering, and it belongs only to the filter it was made
 * under, so a new match is never hidden by a collapse made for an earlier search.
 */
export type CollapseState = {
  browse: {
    collapsedCategoryIds: ReadonlySet<string>
    /** Bands are collapsed while browsing unless the reader has expanded them. */
    expandedBandKeys: ReadonlySet<PreparationBandKey>
  }
  search: SearchCollapse
}

type SearchCollapse = {
  /** The filter the collapse was made under; absent while nothing has been collapsed. */
  filter?: FoodFilterState
  collapsedCategoryIds: ReadonlySet<string>
  collapsedBandKeys: ReadonlySet<PreparationBandKey>
}

declare const preparationBandKeyBrand: unique symbol

/** Identifies one preparation band: a category shown in one preparation state. */
export type PreparationBandKey = string & { readonly [preparationBandKeyBrand]: true }

export const preparationBandKey = (categoryId: string, preparationId: string) =>
  `${categoryId}:${preparationId}` as PreparationBandKey

const emptySearchCollapse: SearchCollapse = { collapsedCategoryIds: new Set(), collapsedBandKeys: new Set() }

/**
 * A search, category, or outcome filter narrows which entries qualify. Selected dietary scopes alone
 * only change which guidance is shown, so they are not filtering.
 */
export const isFiltering = (filter: FoodFilterState) =>
  Boolean(filter.query || filter.categoryId || filter.outcomeBands.length > 0)

export const initialCollapseState = (index: Pick<ContentIndex, 'categories'>): CollapseState => ({
  browse: {
    collapsedCategoryIds: new Set(
      index.categories.filter((category) => category.parentId === null).map((category) => category.id),
    ),
    expandedBandKeys: new Set(),
  },
  search: emptySearchCollapse,
})

const sameMembers = <T>(left: readonly T[], right: readonly T[]) => {
  const leftMembers = new Set(left)
  const rightMembers = new Set(right)
  return leftMembers.size === rightMembers.size && [...leftMembers].every((member) => rightMembers.has(member))
}

/**
 * Scopes belong in the comparison even though they alone are not filtering: under an outcome filter,
 * dropping a scope can bring new matches into view.
 */
export const isSameFilter = (left: FoodFilterState, right: FoodFilterState) =>
  left.query === right.query &&
  left.categoryId === right.categoryId &&
  sameMembers(left.guidanceListIds, right.guidanceListIds) &&
  sameMembers(left.outcomeBands, right.outcomeBands)

/** The search collapse made under this filter, or an empty one when it was made under another. */
const searchCollapseFor = (state: CollapseState, filter: FoodFilterState) =>
  state.search.filter !== undefined && isSameFilter(state.search.filter, filter)
    ? state.search
    : emptySearchCollapse

/**
 * Discards a search collapse made under a different filter. It returns the same state when there is
 * nothing to discard, so a caller can settle the state on every render without looping; returning to
 * an earlier filter therefore opens every group rather than reviving a collapse made for it.
 */
export const settleCollapseState = (state: CollapseState, filter: FoodFilterState): CollapseState =>
  state.search.filter === undefined || isSameFilter(state.search.filter, filter)
    ? state
    : { ...state, search: emptySearchCollapse }

const toggled = <T>(members: ReadonlySet<T>, member: T) => {
  const next = new Set(members)
  if (next.has(member)) {
    next.delete(member)
  } else {
    next.add(member)
  }
  return next
}

export const toggleCategory = (state: CollapseState, categoryId: string, filter: FoodFilterState): CollapseState => {
  if (!isFiltering(filter)) {
    return {
      ...state,
      browse: { ...state.browse, collapsedCategoryIds: toggled(state.browse.collapsedCategoryIds, categoryId) },
    }
  }
  const search = searchCollapseFor(state, filter)
  return {
    ...state,
    search: { ...search, filter, collapsedCategoryIds: toggled(search.collapsedCategoryIds, categoryId) },
  }
}

/**
 * While filtering, only the reader's own search collapse hides a row: every rendered row holds a
 * match or is an ancestor of one, so the browse state must not hide it.
 */
export const collapsedCategoryIds = (state: CollapseState, filter: FoodFilterState): ReadonlySet<string> =>
  isFiltering(filter) ? searchCollapseFor(state, filter).collapsedCategoryIds : state.browse.collapsedCategoryIds

export const isCategoryCollapsed = (state: CollapseState, categoryId: string, filter: FoodFilterState) =>
  collapsedCategoryIds(state, filter).has(categoryId)

export const toggleBand = (state: CollapseState, bandKey: PreparationBandKey, filter: FoodFilterState): CollapseState => {
  if (!isFiltering(filter)) {
    return {
      ...state,
      browse: { ...state.browse, expandedBandKeys: toggled(state.browse.expandedBandKeys, bandKey) },
    }
  }
  const search = searchCollapseFor(state, filter)
  return {
    ...state,
    search: { ...search, filter, collapsedBandKeys: toggled(search.collapsedBandKeys, bandKey) },
  }
}

/** While filtering a band is open unless the reader collapsed it for this filter, as a row is. */
export const isBandCollapsed = (state: CollapseState, bandKey: PreparationBandKey, filter: FoodFilterState) =>
  isFiltering(filter)
    ? searchCollapseFor(state, filter).collapsedBandKeys.has(bandKey)
    : !state.browse.expandedBandKeys.has(bandKey)
