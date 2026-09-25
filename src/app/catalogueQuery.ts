import type { ContentIndex } from '../domain/contentIndex'
import type { OutcomeBand } from '../domain/schemas'

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

// ADR: Model guidance as independent lists and sources.
// See: docs/decisions/2026-09-21 ADR - model guidance as independent lists and sources.md
const defaultScopeSlugCandidates = ['pregnancy-food-safety', 'vegetarian-suitability']

/** The scope slugs selected when a catalogue URL carries no `scope` at all. */
export const defaultScopeSlugs = (index: ContentIndex): string[] => {
  const matches = index.guidanceLists
    .filter((list) => defaultScopeSlugCandidates.includes(list.slug))
    .map((list) => list.slug)
  return matches.length > 0 ? matches : [index.guidanceLists[0].slug]
}

const defaultState = (index: ContentIndex): CatalogueQueryState => ({
  scopeSlugs: defaultScopeSlugs(index),
  outcomeBands: [],
  query: '',
})

export const parseCatalogueQuery = (
  searchParams: URLSearchParams,
  index: ContentIndex,
): ParsedCatalogueQuery => {
  const state = defaultState(index)
  let unavailableFiltersRemoved = false
  const version = searchParams.get('v')

  if (version !== null && version !== '1') {
    unavailableFiltersRemoved = true
  }

  const requestedScopeSlugs = unique((searchParams.get('scope') ?? '').split(',').filter(Boolean))
  if (requestedScopeSlugs.length > 0) {
    const validScopeSlugs = requestedScopeSlugs.filter((slug) => index.guidanceListBySlug(slug) !== undefined)
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
    if (index.categoryBySlug(categorySlug) !== undefined) {
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
  index: ContentIndex,
): URLSearchParams => {
  const scopeSlugs = index.guidanceLists
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

// ADR: Model catalogue subjects and preparation independently.
// See: docs/decisions/2026-09-21 ADR - model catalogue subjects and preparation independently.md
/**
 * The preparation a food page was opened in. It is deliberately not part of `CatalogueQueryState`,
 * so the catalogue's canonical URL never carries one and the back link from a preparation-scoped
 * food page returns to the catalogue the reader came from. An unknown value is stripped, like any
 * other unavailable shared filter, and the page renders as the bare food URL.
 */
export const parsePreparationSlug = (
  searchParams: URLSearchParams,
  index: ContentIndex,
): string | undefined => {
  const slug = searchParams.get('prep')
  return slug !== null && index.preparationBySlug(slug) !== undefined ? slug : undefined
}

/** The search string for a link into a food in a preparation context. */
export const withPreparationSlug = (search: string, preparationSlug?: string): string => {
  if (preparationSlug === undefined) {
    return search
  }
  const searchParams = new URLSearchParams(search)
  searchParams.set('prep', preparationSlug)
  return searchParams.toString()
}
