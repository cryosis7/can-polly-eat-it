import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { buildCatalogueQuery, defaultScopeSlugs, parseCatalogueQuery, withPreparationSlug, type CatalogueQueryState } from '../../app/catalogueQuery'
import { CollapsedRowChip } from '../../components/CollapsedRowChip'
import { GuidanceLayers } from '../../components/GuidanceLayers'
import { GuideEntrySummary } from '../../components/GuideEntrySummary'
import { StatusChip } from '../../components/StatusChip'
import { resolveAssessment, type AssessmentSubjectRef } from '../../domain/assessment'
import {
  entriesSurfacedByDescendants,
  entryRowsByCategoryId,
  rowsByCategoryId,
  visibleCategoryRows,
  withAncestorIds,
  type CategoryEntryGroups,
  type CategoryRowGroups,
} from '../../domain/categoryTree'
import {
  combineOutcomesAcrossLists,
  combinedOutcomeLabel,
  summariseCollapsedRow,
  type CombinedOutcome,
} from '../../domain/collapsedRowSummary'
import {
  collapsedCategoryIds,
  initialCollapseState,
  isBandCollapsed,
  isFiltering as isFilteringBy,
  preparationBandKey,
  settleCollapseState,
  toggleBand,
  toggleCategory as toggleCategoryIn,
  type PreparationBandKey,
} from '../../domain/collapseState'
import type { ContentIndex } from '../../domain/contentIndex'
import { filterCategoryEntries, filterFoods } from '../../domain/filtering'
import type { OutcomeBand } from '../../domain/schemas'

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
  const selectedFoodRows = useMemo(
    () => filterFoods(index, filterState),
    [filterState, index],
  )
  const matchedCategoryRows = useMemo(
    () => filterCategoryEntries(index, filterState),
    [filterState, index],
  )
  // A rule authored above the foods it governs is stated at the head of each band that holds them,
  // so the parent's own food-less band would repeat it directly above them.
  const surfacedBelow = entriesSurfacedByDescendants(matchedCategoryRows, selectedFoodRows, index.tree)
  const selectedCategoryRows = matchedCategoryRows.filter((row) => !surfacedBelow.has(row))
  const matchedCategoryEntryIds = new Set(selectedCategoryRows.map((row) => row.category.id))
  const resultCount = selectedFoodRows.length + selectedCategoryRows.length
  const rowsInCategory = rowsByCategoryId(selectedFoodRows, index)
  const entriesInCategory = entryRowsByCategoryId(selectedCategoryRows, index)
  const contentCategoryIds = new Set([...rowsInCategory.keys(), ...matchedCategoryEntryIds])
  const rowsWithContent = withAncestorIds(categoryRows, contentCategoryIds)
  const hasNonDefaultScope = queryState.scopeSlugs.length !== scopeDefaults.length ||
    !scopeDefaults.every((slug) => queryState.scopeSlugs.includes(slug))
  const isFiltering = isFilteringBy(filterState)
  const effectiveCollapsedIds = collapsedCategoryIds(collapseState, filterState)
  const renderedRows = visibleCategoryRows(
    categoryRows.filter((row) => rowsWithContent.has(row.category.id)),
    effectiveCollapsedIds,
  )

  // ADR: Resolve guidance conservatively without inference.
  // See: docs/decisions/2026-09-21 ADR - resolve guidance conservatively without inference.md
  // Folded once per render rather than per row, so a deep branch costs one pass over the entries
  // rather than one pass per ancestor.
  const combinedOutcomeFor = (subjectRef: AssessmentSubjectRef, preparationId?: string): CombinedOutcome =>
    combineOutcomesAcrossLists(selectedGuidanceLists.map(
      (guidanceList) => resolveAssessment(subjectRef, guidanceList, index, preparationId).status.outcomeBand,
    ))

  const outcomesInCategory = new Map<string, CombinedOutcome[]>()
  const outcomesInBand = new Map<PreparationBandKey, CombinedOutcome[]>()
  const recordOutcome = (categoryId: string, preparationId: string | undefined, outcome: CombinedOutcome) => {
    outcomesInCategory.set(categoryId, [...(outcomesInCategory.get(categoryId) ?? []), outcome])
    if (preparationId !== undefined) {
      const bandKey = preparationBandKey(categoryId, preparationId)
      outcomesInBand.set(bandKey, [...(outcomesInBand.get(bandKey) ?? []), outcome])
    }
  }
  for (const [categoryId, groups] of entriesInCategory) {
    for (const [preparationId, entryRows] of groups) {
      for (const { category } of entryRows) {
        recordOutcome(categoryId, preparationId, combinedOutcomeFor({ kind: 'category', category }, preparationId))
      }
    }
  }
  for (const [categoryId, groups] of rowsInCategory) {
    for (const [preparationId, foodRows] of groups) {
      for (const { food } of foodRows) {
        recordOutcome(categoryId, preparationId, combinedOutcomeFor({ kind: 'food', food }, preparationId))
      }
    }
  }

  // Deepest first, so each category folds its children's already-folded outcomes in. Iterative
  // because the tree has no depth limit and a recursive walk would put that limit back. Every
  // category is visited before any parent that reads it, so a child's entry is always present.
  const outcomesInSubtree = new Map<string, CombinedOutcome[]>()
  for (let position = categoryRows.length - 1; position >= 0; position -= 1) {
    const { category } = categoryRows[position]
    const outcomes = [...(outcomesInCategory.get(category.id) ?? [])]
    for (const childId of index.tree.childIdsByParentId.get(category.id) ?? []) {
      outcomes.push(...outcomesInSubtree.get(childId)!)
    }
    outcomesInSubtree.set(category.id, outcomes)
  }

  // A chip must never summarise a filtered subset: searching `rice` narrows Cereals to one food,
  // and a chip folded over what survived would report the whole group as okay. So a row the reader
  // collapses during a search hides without a chip.
  const chipFor = (outcomes: CombinedOutcome[]) => isFiltering ? undefined : summariseCollapsedRow(outcomes)

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
        {selectedGuidanceLists.filter((list) => list.evidentiaryBasis).map((list) => (
          <p className="evidentiary-basis" key={list.id}>
            {list.title}: {list.evidentiaryBasis}
          </p>
        ))}
        {resultCount === 0 ? (
          <p className="no-results">No foods match these filters. Try clearing a filter or searching for another name.</p>
        ) : (
          <div className="catalogue">
            {renderedRows.map(({ category, breadcrumb, depth }) => {
              const rowGroups: CategoryRowGroups = rowsInCategory.get(category.id) ?? new Map()
              const entryGroups: CategoryEntryGroups = entriesInCategory.get(category.id) ?? new Map()
              // A category's own guidance creates a preparation grouping just as a food's
              // declaration does, so a retired preparation category stays browsable after its rule
              // moves onto its parent, even where no food declares that state.
              const axes = [undefined, ...index.preparationStatesFor(category.id).map((preparation) => preparation.id)]
                .filter((preparationId) => rowGroups.has(preparationId) || entryGroups.has(preparationId))
              const hasUnqualifiedEntry = entryGroups.has(undefined)
              const isCollapsed = effectiveCollapsedIds.has(category.id)
              // Every rendered row is collapsible. A row only renders when it holds foods, holds its
              // own guidance, or is an ancestor of a row that does, and each of those is now hidden
              // by collapsing it — the category's own guidance included, as with a preparation band.
              // A root group spans too much of the catalogue for one chip to say anything useful, so
              // it stays chip-free however it is collapsed.
              const categoryChip = depth > 0 && isCollapsed
                ? chipFor(outcomesInSubtree.get(category.id)!)
                : undefined
              const categoryEntryCount = outcomesInSubtree.get(category.id)!.length
              const categoryCountText = countText(categoryEntryCount, isFiltering)
              // While filtering every row states its matches, so a filtered count never reads as the
              // size of the whole group; while browsing only a chipped row states its entries.
              const showsCategoryCount = isFiltering || categoryChip !== undefined
              const categoryLabel = [
                `${category.name}, level ${depth + 1}`,
                ...(categoryChip === undefined ? [] : [combinedOutcomeLabel[categoryChip]]),
                ...(showsCategoryCount ? [categoryCountText] : []),
              ].join(', ')
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
                      {categoryChip !== undefined && <CollapsedRowChip outcome={categoryChip} />}
                    </button>
                    {showsCategoryCount && (
                      <span aria-hidden="true" className="category-entry-count">{categoryCountText}</span>
                    )}
                  </h3>
                  {!isCollapsed && hasUnqualifiedEntry && (
                    <div className="category-entry">
                      <p className="category-entry-link">
                        <Link to={`/category/${category.slug}?${returnSearch}`}>
                          {category.name} guidance
                        </Link>
                      </p>
                      {selectedGuidanceLists.map((guidanceList) => (
                        <GuideEntrySummary
                          guidanceList={guidanceList}
                          key={guidanceList.id}
                          resolved={resolveAssessment({ kind: 'category', category }, guidanceList, index)}
                          returnSearch={returnSearch}
                          index={index}
                        />
                      ))}
                    </div>
                  )}
                  {!isCollapsed && axes.map((preparationId) => {
                    const preparation = preparationId === undefined
                      ? undefined
                      : index.preparationById(preparationId)
                    const rows = rowGroups.get(preparationId) ?? []
                    // The unqualified entry renders above the preparation groupings, so only a
                    // preparation-qualified entry belongs inside one.
                    const hasEntry = preparation !== undefined && entryGroups.has(preparationId)
                    const entryCount = rows.length + (hasEntry ? 1 : 0)
                    if (rows.length === 0 && !hasEntry) {
                      return null
                    }
                    // The preparation heading takes the level beneath the category, so the foods
                    // inside it sit one level deeper and the outline stays unbroken either way.
                    const FoodHeading = preparation === undefined ? 'h4' : 'h5'
                    // The rule governing a band may be authored on an ancestor, because a source can
                    // state one rule for all seafood while the species are filed under what they
                    // are. It is called out at the head of every band it governs, naming the scope
                    // it was authored at, so it reads as the group's rule rather than as a category.
                    const governing = preparation === undefined ? [] : selectedGuidanceLists
                      .map((guidanceList) => ({
                        guidanceList,
                        resolved: resolveAssessment({ kind: 'category', category }, guidanceList, index, preparationId),
                      }))
                      .filter(({ resolved }) => resolved.assessment !== undefined)
                    const entryContent = (hasEntry || rows.length > 0) && governing.length > 0 && (
                      <>
                        {governing.map(({ guidanceList, resolved }) => (
                          <aside
                            aria-label={`${preparation!.name} guidance for ${category.name}`}
                            className={`preparation-callout tone-${resolved.status.tone}`}
                            key={guidanceList.id}
                          >
                            {selectedGuidanceLists.length > 1 && (
                              <p className="callout-list">{guidanceList.title}</p>
                            )}
                            <StatusChip status={resolved.status} />
                            <GuidanceLayers
                              guidanceList={guidanceList}
                              resolved={resolved}
                              returnSearch={returnSearch}
                            />
                            {hasEntry && (
                              <p className="callout-link">
                                <Link to={`/category/${category.slug}?${withPreparationSlug(returnSearch, preparation!.slug)}`}>
                                  {category.name} guidance
                                </Link>
                              </p>
                            )}
                          </aside>
                        ))}
                      </>
                    )
                    const bandKey = preparation === undefined ? undefined : preparationBandKey(category.id, preparation.id)
                    const isPreparationExpanded = bandKey === undefined
                      || !isBandCollapsed(collapseState, bandKey, filterState)
                    const entryCountText = countText(entryCount, isFiltering)
                    const preparationBandLabel = preparation === undefined ? undefined : `${preparation.name} ${category.name}`
                    const bandChip = bandKey !== undefined && !isPreparationExpanded
                      ? chipFor(outcomesInBand.get(bandKey)!)
                      : undefined
                    const bandLabel = bandChip === undefined
                      ? `${preparationBandLabel}, ${entryCountText}`
                      : `${preparationBandLabel}, ${combinedOutcomeLabel[bandChip]}, ${entryCountText}`
                    const listContent = rows.length > 0 && (
                      <ul className="food-list">
                        {rows.map(({ food }) => (
                          <li className="food-card" key={`${food.id}-${preparationId ?? ''}`}>
                            <div className="food-card-header">
                              <FoodHeading>
                                <Link to={`/food/${food.slug}?${withPreparationSlug(returnSearch, preparation?.slug)}`}>
                                  {food.name}
                                </Link>
                              </FoodHeading>
                            </div>
                            {selectedGuidanceLists.map((guidanceList) => (
                              <GuideEntrySummary
                                guidanceList={guidanceList}
                                key={guidanceList.id}
                                resolved={resolveAssessment({ kind: 'food', food }, guidanceList, index, preparationId)}
                                returnSearch={returnSearch}
                                index={index}
                              />
                            ))}
                          </li>
                        ))}
                      </ul>
                    )

                    return preparation === undefined ? (
                      <div key="unprepared">{listContent}</div>
                    ) : (
                      <section
                        aria-labelledby={`preparation-${category.id}-${preparation.id}`}
                        className="preparation-group"
                        key={preparation.id}
                      >
                        <div className="preparation-header">
                          <button
                            aria-expanded={isPreparationExpanded}
                            aria-label={bandLabel}
                            className="preparation-toggle"
                            onClick={() => togglePreparationBand(bandKey!)}
                            type="button"
                          >
                            <span aria-hidden="true" className="category-toggle-icon">{isPreparationExpanded ? '-' : '+'}</span>
                          </button>
                          <h4 id={`preparation-${category.id}-${preparation.id}`}>
                            {preparationBandLabel}
                            {bandChip !== undefined && <CollapsedRowChip outcome={bandChip} />}
                          </h4>
                          <span aria-hidden="true" className="preparation-count">{entryCountText}</span>
                        </div>
                        {isPreparationExpanded && (
                          <>
                            {entryContent}
                            {listContent}
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
