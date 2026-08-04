import type { GuidanceList } from '../domain/schemas'

export type CatalogueQueryState = {
  displayListSlug: string
  query: string
  categorySlug?: string
  statusSlugsByListSlug: Record<string, string[]>
}

export type ParsedCatalogueQuery = {
  state: CatalogueQueryState
  unavailableFiltersRemoved: boolean
}

const unique = (values: string[]) => [...new Set(values)]

const defaultState = (guidanceLists: GuidanceList[]): CatalogueQueryState => ({
  displayListSlug: guidanceLists[0].slug,
  query: '',
  statusSlugsByListSlug: {},
})

export const parseCatalogueQuery = (
  searchParams: URLSearchParams,
  guidanceLists: GuidanceList[],
  categorySlugs: Set<string>,
): ParsedCatalogueQuery => {
  const state = defaultState(guidanceLists)
  let unavailableFiltersRemoved = false
  const version = searchParams.get('v')

  if (version !== null && version !== '1') {
    unavailableFiltersRemoved = true
  }

  const requestedListSlug = searchParams.get('list')
  if (requestedListSlug) {
    if (guidanceLists.some((list) => list.slug === requestedListSlug) && (version === null || version === '1')) {
      state.displayListSlug = requestedListSlug
    } else {
      unavailableFiltersRemoved = true
    }
  }

  const query = searchParams.get('q')
  if (query) {
    state.query = query.trim()
  }

  const categorySlug = searchParams.get('category')
  if (categorySlug) {
    if (categorySlugs.has(categorySlug)) {
      state.categorySlug = categorySlug
    } else {
      unavailableFiltersRemoved = true
    }
  }

  for (const [key, value] of searchParams.entries()) {
    if (!key.startsWith('status.')) {
      continue
    }
    const listSlug = key.slice('status.'.length)
    const guidanceList = guidanceLists.find((list) => list.slug === listSlug)
    if (!guidanceList) {
      unavailableFiltersRemoved = true
      continue
    }
    const validStatusSlugs = unique(value.split(',').filter((slug) =>
      guidanceList.statuses.some((status) => status.slug === slug),
    ))
    if (validStatusSlugs.length > 0) {
      state.statusSlugsByListSlug[listSlug] = validStatusSlugs
    }
    if (validStatusSlugs.length !== unique(value.split(',').filter(Boolean)).length) {
      unavailableFiltersRemoved = true
    }
  }

  return { state, unavailableFiltersRemoved }
}

export const buildCatalogueQuery = (
  state: CatalogueQueryState,
  guidanceLists: GuidanceList[],
): URLSearchParams => {
  const searchParams = new URLSearchParams({ v: '1', list: state.displayListSlug })
  if (state.query) {
    searchParams.set('q', state.query)
  }
  if (state.categorySlug) {
    searchParams.set('category', state.categorySlug)
  }

  for (const guidanceList of guidanceLists) {
    const selectedSlugs = state.statusSlugsByListSlug[guidanceList.slug] ?? []
    const orderedSlugs = guidanceList.statuses
      .filter((status) => selectedSlugs.includes(status.slug))
      .map((status) => status.slug)
    if (orderedSlugs.length > 0) {
      searchParams.set(`status.${guidanceList.slug}`, orderedSlugs.join(','))
    }
  }

  return searchParams
}
