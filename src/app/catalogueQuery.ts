import type { GuidanceList, OutcomeBand } from '../domain/schemas'

export type CatalogueQueryState = {
  scopeSlugs: string[]
  outcomeBands: OutcomeBand[]
  query: string
  categorySlug?: string
}

export type ParsedCatalogueQuery = {
  state: CatalogueQueryState
  unavailableFiltersRemoved: boolean
}

const unique = (values: string[]) => [...new Set(values)]
const outcomeBandOrder: OutcomeBand[] = ['okay', 'maybe', 'not-okay', 'not-assessed']

const defaultState = (guidanceLists: GuidanceList[]): CatalogueQueryState => ({
  scopeSlugs: [guidanceLists.find((list) => list.slug === 'pregnancy-food-safety')?.slug ?? guidanceLists[0].slug],
  outcomeBands: [],
  query: '',
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

  const requestedScopeSlugs = unique((searchParams.get('scope') ?? '').split(',').filter(Boolean))
  if (requestedScopeSlugs.length > 0) {
    const validScopeSlugs = requestedScopeSlugs.filter((slug) => guidanceLists.some((list) => list.slug === slug))
    if (validScopeSlugs.length > 0 && (version === null || version === '1')) {
      state.scopeSlugs = validScopeSlugs
    }
    if (validScopeSlugs.length !== requestedScopeSlugs.length || version !== null && version !== '1') {
      unavailableFiltersRemoved = true
    }
  }
  if (searchParams.has('list') || [...searchParams.keys()].some((key) => key.startsWith('status.'))) {
    unavailableFiltersRemoved = true
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

  const requestedOutcomes = unique((searchParams.get('outcome') ?? '').split(',').filter(Boolean))
  if (requestedOutcomes.length > 0) {
    const validOutcomes = requestedOutcomes.filter((outcome): outcome is OutcomeBand =>
      outcomeBandOrder.includes(outcome as OutcomeBand),
    )
    if (version === null || version === '1') {
      state.outcomeBands = validOutcomes
    }
    if (validOutcomes.length !== requestedOutcomes.length || version !== null && version !== '1') {
      unavailableFiltersRemoved = true
    }
  }

  return { state, unavailableFiltersRemoved }
}

export const buildCatalogueQuery = (
  state: CatalogueQueryState,
  guidanceLists: GuidanceList[],
): URLSearchParams => {
  const scopeSlugs = guidanceLists
    .filter((list) => state.scopeSlugs.includes(list.slug))
    .map((list) => list.slug)
  const orderedOutcomes = outcomeBandOrder.filter((outcome) => state.outcomeBands.includes(outcome))
  const searchParams = new URLSearchParams({ v: '1', scope: scopeSlugs.join(',') })
  if (state.query) {
    searchParams.set('q', state.query)
  }
  if (state.categorySlug) {
    searchParams.set('category', state.categorySlug)
  }

  if (orderedOutcomes.length > 0) {
    searchParams.set('outcome', orderedOutcomes.join(','))
  }

  return searchParams
}
