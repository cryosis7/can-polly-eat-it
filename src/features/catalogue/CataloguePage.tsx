import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { buildCatalogueQuery, parseCatalogueQuery, withPreparationSlug, type CatalogueQueryState } from '../../app/catalogueQuery'
import { GuidanceLayers } from '../../components/GuidanceLayers'
import { GuideEntrySummary } from '../../components/GuideEntrySummary'
import { StatusChip } from '../../components/StatusChip'
import { resolveAssessment } from '../../domain/assessment'
import {
  entryRowsByCategoryId,
  entriesSurfacedByDescendants,
  flattenCategoryRows,
  preparationIdsByCategoryId,
  rowsByCategoryId,
  visibleCategoryRows,
  withAncestorIds,
  type CategoryEntryGroups,
  type CategoryRowGroups,
} from '../../domain/categoryTree'
import { createContentIndex } from '../../domain/contentIndex'
import { filterCategoryEntries, filterFoods } from '../../domain/filtering'
import type { ContentData } from '../../domain/contentValidation'
import type { OutcomeBand } from '../../domain/schemas'

type CataloguePageProps = {
  content: ContentData
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

const defaultScopeSlug = 'pregnancy-food-safety'

export const CataloguePage = ({ content }: CataloguePageProps) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filterRemovalAnnouncement, setFilterRemovalAnnouncement] = useState('')
  const [collapsedCategoryIds, setCollapsedCategoryIds] = useState(
    () => new Set(content.categories.filter((category) => category.parentId === null).map((category) => category.id)),
  )
  const index = createContentIndex(content.categories, content.assessments)
  const categoryRows = flattenCategoryRows(index.tree)
  const categoryBySlug = new Map(content.categories.map((category) => [category.slug, category]))
  const { state: queryState, unavailableFiltersRemoved } = parseCatalogueQuery(
    searchParams,
    content.guidanceLists,
    new Set(categoryBySlug.keys()),
  )
  const selectedGuidanceLists = content.guidanceLists.filter((list) => queryState.scopeSlugs.includes(list.slug))
  const filterState = {
    query: queryState.query,
    categoryId: queryState.categorySlug ? categoryBySlug.get(queryState.categorySlug)?.id : undefined,
    guidanceListIds: selectedGuidanceLists.map((list) => list.id),
    outcomeBands: queryState.outcomeBands,
  }
  const selectedFoodRows = filterFoods(content.foods, content.guidanceLists, index, filterState)
  const matchedCategoryRows = filterCategoryEntries(
    content.categories,
    content.assessments,
    content.preparations,
    content.guidanceLists,
    index,
    filterState,
  )
  // A rule authored above the foods it governs is stated at the head of each band that holds them,
  // so the parent's own food-less band would repeat it directly above them.
  const surfacedBelow = entriesSurfacedByDescendants(matchedCategoryRows, selectedFoodRows, index.tree)
  const selectedCategoryRows = matchedCategoryRows.filter((row) => !surfacedBelow.has(row))
  const matchedCategoryEntryIds = new Set(selectedCategoryRows.map((row) => row.category.id))
  const resultCount = selectedFoodRows.length + selectedCategoryRows.length
  const preparationById = new Map(content.preparations.map((preparation) => [preparation.id, preparation]))
  const preparationOrder = preparationIdsByCategoryId(content.foods, content.assessments, content.preparations)
  const rowsInCategory = rowsByCategoryId(selectedFoodRows, preparationOrder)
  const entriesInCategory = entryRowsByCategoryId(selectedCategoryRows, preparationOrder)
  const contentCategoryIds = new Set([...rowsInCategory.keys(), ...matchedCategoryEntryIds])
  const rowsWithContent = withAncestorIds(categoryRows, contentCategoryIds)
  const isFiltering = Boolean(queryState.query || queryState.categorySlug || queryState.outcomeBands.length > 0)
  const effectiveCollapsedIds = isFiltering
    ? new Set([...collapsedCategoryIds].filter((id) => !rowsWithContent.has(id)))
    : collapsedCategoryIds
  const renderedRows = visibleCategoryRows(
    categoryRows.filter((row) => rowsWithContent.has(row.category.id)),
    effectiveCollapsedIds,
  )
  const toggleCategory = (categoryId: string) => {
    setCollapsedCategoryIds((current) => {
      const next = new Set(current)
      if (next.has(categoryId)) {
        next.delete(categoryId)
      } else {
        next.add(categoryId)
      }
      return next
    })
  }
  const hasNonDefaultScope = queryState.scopeSlugs.length !== 1 || queryState.scopeSlugs[0] !== defaultScopeSlug
  const hasActiveFilters = Boolean(
    queryState.query || queryState.categorySlug || queryState.outcomeBands.length > 0 || hasNonDefaultScope,
  )
  const [isFilterDisclosureOpen, setFilterDisclosureOpen] = useState(
    () => window.matchMedia('(min-width: 48rem)').matches,
  )

  useEffect(() => {
    const canonicalSearch = buildCatalogueQuery(queryState, content.guidanceLists).toString()
    if (canonicalSearch !== searchParams.toString()) {
      setSearchParams(canonicalSearch, { replace: true })
    }
  }, [content.guidanceLists, queryState, searchParams, setSearchParams])

  useEffect(() => {
    if (unavailableFiltersRemoved) {
      // Deferred deliberately: role="status" is a polite live region, and assistive
      // technology announces content changes rather than content already present on
      // first paint. Deriving this during render would silence the announcement.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFilterRemovalAnnouncement('Unavailable shared filters were removed.')
    }
  }, [unavailableFiltersRemoved])

  const updateQueryState = (
    update: (current: CatalogueQueryState) => CatalogueQueryState,
    replace = false,
  ) => {
    setSearchParams(buildCatalogueQuery(update(queryState), content.guidanceLists), { replace })
  }

  const returnSearch = buildCatalogueQuery(queryState, content.guidanceLists).toString()

  return (
    <main className="page-content content-width" id="main-content" tabIndex={-1}>
      <section aria-labelledby="guide-title" className="guide-intro">
        <p className="eyebrow">Food guide</p>
        <h1 id="guide-title">Polly&apos;s Food Guide</h1>
        <p>Find food guidance for the dietary scopes that matter to you.</p>
      </section>

      <section aria-labelledby="catalogue-heading">
        <h2 id="catalogue-heading">Browse foods</h2>
        <div className="catalogue-tools">
          <form className="search-controls" role="search" onSubmit={(event) => event.preventDefault()}>
            <div className="filter-field filter-search">
              <label htmlFor="food-search">Search foods</label>
              <input
                id="food-search"
                type="search"
                value={queryState.query}
                onChange={(event) => updateQueryState(
                  (current) => ({ ...current, query: event.target.value }),
                  true,
                )}
              />
            </div>
          </form>
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
                {content.guidanceLists.map((list) => {
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
                  scopeSlugs: [defaultScopeSlug],
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
              <li><button type="button" onClick={() => updateQueryState((current) => ({ ...current, categorySlug: undefined }))}>Category: {categoryBySlug.get(queryState.categorySlug)?.name}</button></li>
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
            {renderedRows.map(({ category, breadcrumb, depth, hasChildCategories }) => {
              const rowGroups: CategoryRowGroups = rowsInCategory.get(category.id) ?? new Map()
              const entryGroups: CategoryEntryGroups = entriesInCategory.get(category.id) ?? new Map()
              // A category's own guidance creates a preparation grouping just as a food's
              // declaration does, so a retired preparation category stays browsable after its rule
              // moves onto its parent, even where no food declares that state.
              const axes = [undefined, ...(preparationOrder.get(category.id) ?? [])]
                .filter((preparationId) => rowGroups.has(preparationId) || entryGroups.has(preparationId))
              const rowCount = [...rowGroups.values()].reduce((total, rows) => total + rows.length, 0)
              const hasUnqualifiedEntry = entryGroups.has(undefined)
              // Only a qualified entry renders inside the collapse, so an unqualified-only category
              // stays a plain heading rather than gaining a toggle that expands to nothing.
              const collapsibleEntryCount = [...entryGroups.keys()]
                .filter((preparationId) => preparationId !== undefined).length
              const isExpandable = hasChildCategories || rowCount > 0 || collapsibleEntryCount > 0
              const isCollapsed = effectiveCollapsedIds.has(category.id)
              return (
                <section
                  aria-labelledby={`category-${category.id}`}
                  className="category-group"
                  key={category.id}
                  style={{ '--category-indent': `${Math.min(depth, 6)}rem` } as React.CSSProperties}
                >
                  {depth > 0 && <p className="breadcrumb">{breadcrumb}</p>}
                  <h3 id={`category-${category.id}`}>
                    {isExpandable ? (
                      <button
                        aria-expanded={!isCollapsed}
                        aria-label={`${category.name}, level ${depth + 1}`}
                        className="category-toggle"
                        onClick={() => toggleCategory(category.id)}
                        type="button"
                      >
                        <span aria-hidden="true" className="category-toggle-icon">{isCollapsed ? '+' : '-'}</span>
                        <span>{category.name}</span>
                      </button>
                    ) : category.name}
                  </h3>
                  {hasUnqualifiedEntry && (
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
                          sources={content.sources}
                        />
                      ))}
                    </div>
                  )}
                  {!isCollapsed && axes.map((preparationId) => {
                    const preparation = preparationId === undefined
                      ? undefined
                      : preparationById.get(preparationId)!
                    const rows = rowGroups.get(preparationId) ?? []
                    // The unqualified entry renders above, outside the collapse, so only a
                    // preparation-qualified entry belongs inside a grouping.
                    const hasEntry = preparation !== undefined && entryGroups.has(preparationId)
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
                                sources={content.sources}
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
                        <h4 id={`preparation-${category.id}-${preparation.id}`}>{preparation.name}</h4>
                        {entryContent}
                        {listContent}
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
