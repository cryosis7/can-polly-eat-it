import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { buildCatalogueQuery, defaultScopeSlugs, parseCatalogueQuery, withPreparationSlug, type CatalogueQueryState } from '../../app/catalogueQuery'
import { CollapsedRowChip } from '../../components/CollapsedRowChip'
import { GuidanceLayers } from '../../components/GuidanceLayers'
import { GuideEntrySummary } from '../../components/GuideEntrySummary'
import { StatusChip } from '../../components/StatusChip'
import { listCatalogue, type ListedFood } from '../../domain/catalogueListing'
import { combinedOutcomeLabel } from '../../domain/collapsedRowSummary'
import {
  initialCollapseState,
  settleCollapseState,
  toggleBand,
  toggleCategory as toggleCategoryIn,
  type PreparationBandKey,
} from '../../domain/collapseState'
import type { ContentIndex } from '../../domain/contentIndex'
import type { OutcomeBand, Preparation } from '../../domain/schemas'

type CataloguePageProps = {
  index: ContentIndex
}

type SearchControlProps = {
  onSettledChange: (query: string) => void
  value: string
}

const searchSettleDelayMs = 250

const SearchControl = ({ onSettledChange, value }: SearchControlProps) => {
  const [draftValue, setDraftValue] = useState(value)
  const pendingSettledValue = useRef<string | null>(null)

  useEffect(() => {
    if (pendingSettledValue.current === value) {
      pendingSettledValue.current = null
      return
    }
    pendingSettledValue.current = null
    // The URL can change independently through direct navigation, history, or a filter chip.
    setDraftValue(value)
  }, [value])

  const settleDraft = useCallback(() => {
    const settledValue = draftValue.trim()
    if (settledValue === value) {
      return
    }

    pendingSettledValue.current = settledValue
    onSettledChange(settledValue)
  }, [draftValue, onSettledChange, value])

  useEffect(() => {
    if (draftValue.trim() === value) {
      return
    }

    const timeoutId = window.setTimeout(settleDraft, searchSettleDelayMs)
    return () => window.clearTimeout(timeoutId)
  }, [draftValue, settleDraft, value])

  return (
    <form
      className="search-controls"
      role="search"
      onSubmit={(event) => {
        event.preventDefault()
        settleDraft()
      }}
    >
      <div className="filter-field filter-search">
        <label htmlFor="food-search">Search foods</label>
        <input
          id="food-search"
          type="search"
          value={draftValue}
          onChange={(event) => setDraftValue(event.target.value)}
        />
      </div>
    </form>
  )
}

const primaryOutcomes: { value: OutcomeBand, label: string }[] = [
  { value: 'okay', label: 'Okay' },
  { value: 'maybe', label: 'Maybe - see notes' },
  { value: 'not-okay', label: 'Not okay' },
]

const outcomeLabels: Record<OutcomeBand, string> = {
  okay: 'Okay',
  maybe: 'Maybe - see notes',
  'not-okay': 'Not okay',
  'not-assessed': 'Not assessed',
}

/** Under a filter a count covers only the matching subset, so it is worded as matches. */
const countText = (count: number, isFiltering: boolean) => isFiltering
  ? `${count} ${count === 1 ? 'match' : 'matches'}`
  : `${count} ${count === 1 ? 'entry' : 'entries'}`

export const CataloguePage = ({ index }: CataloguePageProps) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filterRemovalAnnouncement, setFilterRemovalAnnouncement] = useState('')
  const [storedCollapseState, setCollapseState] = useState(() => initialCollapseState(index))
  const categoryRows = index.categoryOutline
  const searchParamsString = searchParams.toString()
  const { state: queryState, unavailableFiltersRemoved } = useMemo(
    () => parseCatalogueQuery(new URLSearchParams(searchParamsString), index),
    [index, searchParamsString],
  )
  const selectedGuidanceLists = useMemo(
    () => index.guidanceLists.filter((list) => queryState.scopeSlugs.includes(list.slug)),
    [index.guidanceLists, queryState.scopeSlugs],
  )
  const scopeDefaults = useMemo(() => defaultScopeSlugs(index), [index])
  const filterState = useMemo(() => ({
    query: queryState.query,
    categoryId: queryState.categorySlug ? index.categoryBySlug(queryState.categorySlug)?.id : undefined,
    guidanceListIds: selectedGuidanceLists.map((list) => list.id),
    outcomeBands: queryState.outcomeBands,
  }), [index, queryState.categorySlug, queryState.outcomeBands, queryState.query, selectedGuidanceLists])
  // Settled during render rather than in an effect, so a search collapse made under another filter
  // is never painted, and returning to that filter later cannot revive it.
  const collapseState = settleCollapseState(storedCollapseState, filterState)
  if (collapseState !== storedCollapseState) {
    setCollapseState(collapseState)
  }
  const listing = useMemo(
    () => listCatalogue(index, filterState, collapseState),
    [collapseState, filterState, index],
  )
  const { filtering: isFiltering, resultCount } = listing
  const hasNonDefaultScope = queryState.scopeSlugs.length !== scopeDefaults.length ||
    !scopeDefaults.every((slug) => queryState.scopeSlugs.includes(slug))

  const toggleCategory = (categoryId: string) => {
    setCollapseState((current) => toggleCategoryIn(current, categoryId, filterState))
  }
  const togglePreparationBand = (bandKey: PreparationBandKey) => {
    setCollapseState((current) => toggleBand(current, bandKey, filterState))
  }
  const hasActiveFilters = Boolean(
    queryState.query || queryState.categorySlug || queryState.outcomeBands.length > 0 || hasNonDefaultScope,
  )
  const [isFilterDisclosureOpen, setFilterDisclosureOpen] = useState(
    () => window.matchMedia('(min-width: 48rem)').matches,
  )

  useEffect(() => {
    const canonicalSearch = buildCatalogueQuery(queryState, index).toString()
    if (canonicalSearch !== searchParams.toString()) {
      setSearchParams(canonicalSearch, { replace: true })
    }
  }, [index, queryState, searchParams, setSearchParams])

  useEffect(() => {
    if (unavailableFiltersRemoved) {
      // Deferred deliberately: role="status" is a polite live region, and assistive
      // technology announces content changes rather than content already present on
      // first paint. Deriving this during render would silence the announcement.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFilterRemovalAnnouncement('Unavailable shared filters were removed.')
    }
  }, [unavailableFiltersRemoved])

  const updateQueryState = useCallback((
    update: (current: CatalogueQueryState) => CatalogueQueryState,
    replace = false,
  ) => {
    setSearchParams(buildCatalogueQuery(update(queryState), index), { replace })
  }, [index, queryState, setSearchParams])

  const updateSearchQuery = useCallback((query: string) => {
    startTransition(() => {
      updateQueryState((current) => ({ ...current, query }), true)
    })
  }, [updateQueryState])

  const returnSearch = buildCatalogueQuery(queryState, index).toString()

  return (
    <main className="page-content content-width" id="main-content" tabIndex={-1}>
      <section aria-labelledby="guide-title" className="guide-intro">
        <p className="eyebrow">Food guide</p>
        <h1 id="guide-title">Polly&apos;s Food Guide</h1>
        <p>Find food guidance for when you&apos;re cooking for Polly.</p>
      </section>

      <section aria-labelledby="catalogue-heading">
        <h2 id="catalogue-heading">Browse foods</h2>
        <div className="catalogue-tools">
          <SearchControl onSettledChange={updateSearchQuery} value={queryState.query} />
          <details
            className="filter-disclosure"
            open={isFilterDisclosureOpen}
            onToggle={(event) => setFilterDisclosureOpen((event.currentTarget as HTMLDetailsElement).open)}
          >
            <summary>Filters</summary>
            <div className="filter-controls">
              <div className="filter-field">
                <label htmlFor="category-filter">Category</label>
                <select
                  id="category-filter"
                  value={queryState.categorySlug ?? ''}
                  onChange={(event) => updateQueryState((current) => ({
                    ...current,
                    categorySlug: event.target.value || undefined,
                  }))}
                >
                  <option value="">All categories</option>
                  {categoryRows.map(({ category, breadcrumb }) => (
                    <option key={category.id} value={category.slug}>{breadcrumb}</option>
                  ))}
                </select>
              </div>
              <fieldset className="status-filters">
                <legend>Dietary scopes</legend>
                {index.guidanceLists.map((list) => {
                  const isSelected = queryState.scopeSlugs.includes(list.slug)
                  return (
                    <label key={list.id}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={isSelected && queryState.scopeSlugs.length === 1}
                        onChange={() => updateQueryState((current) => ({
                          ...current,
                          scopeSlugs: isSelected
                            ? current.scopeSlugs.filter((slug) => slug !== list.slug)
                            : [...current.scopeSlugs, list.slug],
                        }))}
                      />
                      {list.title}
                    </label>
                  )
                })}
              </fieldset>
              <fieldset className="status-filters">
                <legend>Outcome</legend>
                <p>Selected outcomes must match every selected dietary scope.</p>
                {primaryOutcomes.map((outcome) => (
                  <label key={outcome.value}>
                    <input
                      type="checkbox"
                      checked={queryState.outcomeBands.includes(outcome.value)}
                      onChange={() => updateQueryState((current) => ({
                        ...current,
                        outcomeBands: current.outcomeBands.includes(outcome.value)
                          ? current.outcomeBands.filter((band) => band !== outcome.value)
                          : [...current.outcomeBands, outcome.value],
                      }))}
                    />
                    {outcome.label}
                  </label>
                ))}
              </fieldset>
              <button
                type="button"
                className="clear-filters"
                disabled={!hasActiveFilters}
                onClick={() => updateQueryState((current) => ({
                  ...current,
                  query: '',
                  categorySlug: undefined,
                  scopeSlugs: scopeDefaults,
                  outcomeBands: [],
                }))}
              >
                Clear filters
              </button>
            </div>
          </details>
        </div>

        {hasActiveFilters && (
          <ul aria-label="Active filters" className="filter-chips">
            {queryState.query && (
              <li><button type="button" onClick={() => updateQueryState((current) => ({ ...current, query: '' }))}>Search: {queryState.query}</button></li>
            )}
            {queryState.categorySlug && (
              <li><button type="button" onClick={() => updateQueryState((current) => ({ ...current, categorySlug: undefined }))}>Category: {index.categoryBySlug(queryState.categorySlug)?.name}</button></li>
            )}
            {hasNonDefaultScope && selectedGuidanceLists.map((list) => (
              <li key={list.id}>
                <button
                  type="button"
                  disabled={queryState.scopeSlugs.length === 1}
                  onClick={() => updateQueryState((current) => ({
                    ...current,
                    scopeSlugs: current.scopeSlugs.filter((slug) => slug !== list.slug),
                  }))}
                >
                  Dietary scope: {list.title}
                </button>
              </li>
            ))}
            {queryState.outcomeBands.map((outcomeBand) => {
              return (
                <li key={outcomeBand}>
                  <button
                    type="button"
                    onClick={() => updateQueryState((current) => ({
                      ...current,
                      outcomeBands: current.outcomeBands.filter((band) => band !== outcomeBand),
                    }))}
                  >
                    Outcome: {outcomeLabels[outcomeBand]}
                  </button>
                </li>
              )
            })}
          </ul>
        )}

        <p className="result-count" aria-live="polite">
          {resultCount} {resultCount === 1 ? 'result' : 'results'} in the guide
        </p>
        <p className="visually-hidden" role="status">{filterRemovalAnnouncement}</p>
        {listing.guidanceLists.filter((list) => list.evidentiaryBasis).map((list) => (
          <p className="evidentiary-basis" key={list.id}>
            {list.title}: {list.evidentiaryBasis}
          </p>
        ))}
        {resultCount === 0 ? (
          <p className="no-results">No foods match these filters. Try clearing a filter or searching for another name.</p>
        ) : (
          <div className="catalogue">
            {listing.sections.map(({ category, breadcrumb, depth, collapsed: isCollapsed, entryCount, chip, ownEntry, unpreparedFoods, bands }) => {
              const categoryCountText = countText(entryCount, isFiltering)
              // While filtering every row states its matches, so a filtered count never reads as the
              // size of the whole group; while browsing only a chipped row states its entries.
              const showsCategoryCount = isFiltering || chip !== undefined
              const categoryLabel = [
                `${category.name}, level ${depth + 1}`,
                ...(chip === undefined ? [] : [combinedOutcomeLabel[chip]]),
                ...(showsCategoryCount ? [categoryCountText] : []),
              ].join(', ')
              // The preparation heading takes the level beneath the category, so the foods inside it
              // sit one level deeper and the outline stays unbroken either way.
              const foodList = (foods: readonly ListedFood[], preparation?: Preparation) => {
                const FoodHeading = preparation === undefined ? 'h4' : 'h5'
                return foods.length > 0 && (
                  <ul className="food-list">
                    {foods.map(({ food, resolved }) => (
                      <li className="food-card" key={`${food.id}-${preparation?.id ?? ''}`}>
                        <div className="food-card-header">
                          <FoodHeading>
                            <Link to={`/food/${food.slug}?${withPreparationSlug(returnSearch, preparation?.slug)}`}>
                              {food.name}
                            </Link>
                          </FoodHeading>
                        </div>
                        {resolved.map(({ guidanceList, resolved: listResolved }) => (
                          <GuideEntrySummary
                            guidanceList={guidanceList}
                            key={guidanceList.id}
                            resolved={listResolved}
                            returnSearch={returnSearch}
                            index={index}
                          />
                        ))}
                      </li>
                    ))}
                  </ul>
                )
              }
              return (
                <section
                  aria-labelledby={`category-${category.id}`}
                  className="category-group"
                  key={category.id}
                  style={{ '--category-indent': `${Math.min(depth, 6)}rem` } as React.CSSProperties}
                >
                  {depth > 0 && <p className="breadcrumb">{breadcrumb}</p>}
                  <h3 id={`category-${category.id}`}>
                    <button
                      aria-expanded={!isCollapsed}
                      aria-label={categoryLabel}
                      className="category-toggle"
                      onClick={() => toggleCategory(category.id)}
                      type="button"
                    >
                      <span aria-hidden="true" className="category-toggle-icon">{isCollapsed ? '+' : '-'}</span>
                      <span>{category.name}</span>
                      {chip !== undefined && <CollapsedRowChip outcome={chip} />}
                    </button>
                    {showsCategoryCount && (
                      <span aria-hidden="true" className="category-entry-count">{categoryCountText}</span>
                    )}
                  </h3>
                  {ownEntry !== undefined && (
                    <div className="category-entry">
                      <p className="category-entry-link">
                        <Link to={`/category/${category.slug}?${returnSearch}`}>
                          {category.name} guidance
                        </Link>
                      </p>
                      {ownEntry.resolved.map(({ guidanceList, resolved }) => (
                        <GuideEntrySummary
                          guidanceList={guidanceList}
                          key={guidanceList.id}
                          resolved={resolved}
                          returnSearch={returnSearch}
                          index={index}
                        />
                      ))}
                    </div>
                  )}
                  {unpreparedFoods.length > 0 && <div>{foodList(unpreparedFoods)}</div>}
                  {bands.map(({ key, preparation, collapsed: isBandCollapsed, entryCount: bandEntryCount, chip: bandChip, governingRules, hasOwnEntry, foods }) => {
                    const entryCountText = countText(bandEntryCount, isFiltering)
                    const preparationBandLabel = `${preparation.name} ${category.name}`
                    const bandLabel = bandChip === undefined
                      ? `${preparationBandLabel}, ${entryCountText}`
                      : `${preparationBandLabel}, ${combinedOutcomeLabel[bandChip]}, ${entryCountText}`
                    return (
                      <section
                        aria-labelledby={`preparation-${category.id}-${preparation.id}`}
                        className="preparation-group"
                        key={preparation.id}
                      >
                        <div className="preparation-header">
                          <button
                            aria-expanded={!isBandCollapsed}
                            aria-label={bandLabel}
                            className="preparation-toggle"
                            onClick={() => togglePreparationBand(key)}
                            type="button"
                          >
                            <span aria-hidden="true" className="category-toggle-icon">{isBandCollapsed ? '+' : '-'}</span>
                          </button>
                          <h4 id={`preparation-${category.id}-${preparation.id}`}>
                            {preparationBandLabel}
                            {bandChip !== undefined && <CollapsedRowChip outcome={bandChip} />}
                          </h4>
                          <span aria-hidden="true" className="preparation-count">{entryCountText}</span>
                        </div>
                        {!isBandCollapsed && (
                          <>
                            {/* Each callout names the scope its rule was authored at, so it reads as
                                the group's rule about this preparation rather than as a category. */}
                            {governingRules.map(({ guidanceList, resolved }) => (
                              <aside
                                aria-label={`${preparation.name} guidance for ${category.name}`}
                                className={`preparation-callout tone-${resolved.status.tone}`}
                                key={guidanceList.id}
                              >
                                {listing.guidanceLists.length > 1 && (
                                  <p className="callout-list">{guidanceList.title}</p>
                                )}
                                <StatusChip status={resolved.status} />
                                <GuidanceLayers
                                  guidanceList={guidanceList}
                                  resolved={resolved}
                                  returnSearch={returnSearch}
                                />
                                {hasOwnEntry && (
                                  <p className="callout-link">
                                    <Link to={`/category/${category.slug}?${withPreparationSlug(returnSearch, preparation.slug)}`}>
                                      {category.name} guidance
                                    </Link>
                                  </p>
                                )}
                              </aside>
                            ))}
                            {foodList(foods, preparation)}
                          </>
                        )}
                      </section>
                    )
                  })}
                </section>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}
