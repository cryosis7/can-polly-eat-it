import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { buildCatalogueQuery, parseCatalogueQuery, type CatalogueQueryState } from '../../app/catalogueQuery'
import { GuideEntrySummary } from '../../components/GuideEntrySummary'
import { resolveAssessment } from '../../domain/assessment'
import { flattenCategoryRows, foodsByCategoryId, visibleCategoryRows, withAncestorIds } from '../../domain/categoryTree'
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
  'outside-coverage': 'Outside current coverage',
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
  const selectedFoods = filterFoods(content.foods, content.guidanceLists, index, filterState)
  const selectedCategoryEntries = filterCategoryEntries(content.categories, content.guidanceLists, index, filterState)
  const matchedCategoryEntryIds = new Set(selectedCategoryEntries.map((category) => category.id))
  const resultCount = selectedFoods.length + selectedCategoryEntries.length
  const foodsInCategory = foodsByCategoryId(selectedFoods)
  const contentCategoryIds = new Set([...foodsInCategory.keys(), ...matchedCategoryEntryIds])
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
              const foods = foodsInCategory.get(category.id) ?? []
              const isCategoryEntry = matchedCategoryEntryIds.has(category.id)
              const isExpandable = hasChildCategories || foods.length > 0
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
                  {isCategoryEntry && (
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
                        />
                      ))}
                    </div>
                  )}
                  {!isCollapsed && foods.length > 0 && (
                    <ul className="food-list">
                      {foods.map((food) => (
                        <li className="food-card" key={food.id}>
                          <div className="food-card-header">
                            <h4><Link to={`/food/${food.slug}?${returnSearch}`}>{food.name}</Link></h4>
                          </div>
                          {selectedGuidanceLists.map((guidanceList) => (
                            <GuideEntrySummary
                              guidanceList={guidanceList}
                              key={guidanceList.id}
                              resolved={resolveAssessment({ kind: 'food', food }, guidanceList, index)}
                              returnSearch={returnSearch}
                            />
                          ))}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}
