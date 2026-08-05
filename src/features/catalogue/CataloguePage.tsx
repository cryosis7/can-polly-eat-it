import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { buildCatalogueQuery, parseCatalogueQuery, type CatalogueQueryState } from '../../app/catalogueQuery'
import { resolveAssessment } from '../../domain/assessment'
import { buildCategoryTree, flattenCategoryRows, foodsByCategoryId } from '../../domain/categoryTree'
import { filterFoods } from '../../domain/filtering'
import type { ContentData } from '../../domain/contentValidation'

type CataloguePageProps = {
  content: ContentData
}

const statusIcon = {
  green: 'OK',
  amber: '!',
  red: 'X',
  grey: '?',
} as const

const toneDescription = {
  green: 'reviewed as suitable',
  amber: 'requires care',
  red: 'not suitable',
  grey: 'not established as safe',
} as const

export const CataloguePage = ({ content }: CataloguePageProps) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filterRemovalAnnouncement, setFilterRemovalAnnouncement] = useState('')
  const tree = buildCategoryTree(content.categories)
  const categoryRows = flattenCategoryRows(tree)
  const categoryBySlug = new Map(content.categories.map((category) => [category.slug, category]))
  const { state: queryState, unavailableFiltersRemoved } = parseCatalogueQuery(
    searchParams,
    content.guidanceLists,
    new Set(categoryBySlug.keys()),
  )
  const guidanceList = content.guidanceLists.find((list) => list.slug === queryState.displayListSlug)!
  const statusIdsByGuidanceListId = Object.fromEntries(
    Object.entries(queryState.statusSlugsByListSlug).map(([listSlug, statusSlugs]) => {
      const list = content.guidanceLists.find((candidate) => candidate.slug === listSlug)!
      return [list.id, list.statuses.filter((status) => statusSlugs.includes(status.slug)).map((status) => status.id)]
    }),
  )
  const selectedFoods = filterFoods(
    content.foods,
    content.categories,
    content.guidanceLists,
    content.assessments,
    {
      query: queryState.query,
      categoryId: queryState.categorySlug ? categoryBySlug.get(queryState.categorySlug)?.id : undefined,
      statusIdsByGuidanceListId,
    },
  )
  const foodsInCategory = foodsByCategoryId(selectedFoods)
  const hasActiveFilters = Boolean(
    queryState.query || queryState.categorySlug || Object.keys(queryState.statusSlugsByListSlug).length > 0,
  )
  const statusFacetLists = [
    guidanceList,
    ...content.guidanceLists.filter((list) => list.id !== guidanceList.id),
  ]
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
      setFilterRemovalAnnouncement('Unavailable shared filters were removed.')
    }
  }, [unavailableFiltersRemoved])

  const updateQueryState = (
    update: (current: CatalogueQueryState) => CatalogueQueryState,
    replace = false,
  ) => {
    setSearchParams(buildCatalogueQuery(update(queryState), content.guidanceLists), { replace })
  }

  return (
    <main className="page-content content-width" id="main-content" tabIndex={-1}>
      <section aria-labelledby="guide-title" className="guide-intro">
        <p className="eyebrow">Food guide</p>
        <h1 id="guide-title">{guidanceList.title}</h1>
        <p>{guidanceList.description}</p>
        <dl className="status-key" aria-label="Status meanings">
          {guidanceList.statuses.map((status) => (
            <div className={`status-key-item tone-${status.tone}`} key={status.id}>
              <dt><span aria-hidden="true" className={`status-icon tone-${status.tone}`}>{statusIcon[status.tone]}</span>{status.label}</dt>
              <dd>{toneDescription[status.tone]}</dd>
            </div>
          ))}
        </dl>
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
          <div className="filter-field">
            <label htmlFor="guidance-list">Guidance list</label>
            <select
              id="guidance-list"
              value={guidanceList.slug}
              onChange={(event) => updateQueryState((current) => ({
                ...current,
                displayListSlug: event.target.value,
              }))}
            >
              {content.guidanceLists.map((list) => (
                <option key={list.id} value={list.slug}>{list.title}</option>
              ))}
            </select>
          </div>
          {statusFacetLists.map((list) => {
            const selectedStatusSlugs = queryState.statusSlugsByListSlug[list.slug] ?? []
            return (
              <fieldset className="status-filters" key={list.id}>
                <legend>Filter by {list.title}</legend>
                {list.statuses.map((status) => (
                  <label key={status.id}>
                    <input
                      type="checkbox"
                      checked={selectedStatusSlugs.includes(status.slug)}
                      onChange={() => updateQueryState((current) => {
                        const selected = current.statusSlugsByListSlug[list.slug] ?? []
                        const nextSelected = selected.includes(status.slug)
                          ? selected.filter((slug) => slug !== status.slug)
                          : [...selected, status.slug]
                        const statusSlugsByListSlug = { ...current.statusSlugsByListSlug }
                        if (nextSelected.length > 0) {
                          statusSlugsByListSlug[list.slug] = nextSelected
                        } else {
                          delete statusSlugsByListSlug[list.slug]
                        }
                        return { ...current, statusSlugsByListSlug }
                      })}
                    />
                    {status.filterLabel}
                  </label>
                ))}
              </fieldset>
            )
          })}
          <button
            type="button"
            className="clear-filters"
            disabled={!hasActiveFilters}
            onClick={() => updateQueryState((current) => ({
              ...current,
              query: '',
              categorySlug: undefined,
              statusSlugsByListSlug: {},
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
            {content.guidanceLists.flatMap((list) =>
              (queryState.statusSlugsByListSlug[list.slug] ?? []).map((statusSlug) => {
                const status = list.statuses.find((candidate) => candidate.slug === statusSlug)!
                return (
                  <li key={`${list.id}-${status.id}`}>
                    <button
                      type="button"
                      onClick={() => updateQueryState((current) => ({
                        ...current,
                        statusSlugsByListSlug: Object.fromEntries(
                          Object.entries(current.statusSlugsByListSlug)
                            .map(([slug, selected]) => [
                              slug,
                              slug === list.slug ? selected.filter((candidate) => candidate !== status.slug) : selected,
                            ])
                            .filter(([, selected]) => selected.length > 0),
                        ),
                      }))}
                    >
                      {list.slug}: {status.filterLabel}
                    </button>
                  </li>
                )
              }),
            )}
          </ul>
        )}

        <p className="result-count" aria-live="polite">
          {selectedFoods.length} {selectedFoods.length === 1 ? 'food' : 'foods'} in the guide
        </p>
        <p className="visually-hidden" role="status">{filterRemovalAnnouncement}</p>
        {selectedFoods.length === 0 ? (
          <p className="no-results">No foods match these filters. Try clearing a filter or searching for another name.</p>
        ) : (
        <div className="catalogue">
          {categoryRows.map(({ category, breadcrumb, depth }) => {
            const foods = foodsInCategory.get(category.id) ?? []
            if (foods.length === 0) {
              return null
            }
            return (
              <section
                aria-labelledby={`category-${category.id}`}
                className="category-group"
                key={category.id}
                style={{ '--category-indent': `${Math.min(depth, 6)}rem` } as React.CSSProperties}
              >
                <p className="breadcrumb">{breadcrumb}</p>
                <h3 id={`category-${category.id}`}>{category.name}</h3>
                <ul className="food-list">
                  {foods.map((food) => {
                    const resolved = resolveAssessment(food, guidanceList, content.assessments, content.categories)
                    const citation = resolved.assessment?.citations[0] ?? guidanceList.coverage.citations[0]
                    return (
                      <li className={`food-card tone-${resolved.status.tone}`} key={food.id}>
                        <div className="food-card-header">
                          <h4><Link to={`/food/${food.slug}?v=1&list=${guidanceList.slug}`}>{food.name}</Link></h4>
                          <p className={`status tone-${resolved.status.tone}`}>
                            <span aria-hidden="true" className="status-icon">{statusIcon[resolved.status.tone]}</span>
                            <span>{resolved.status.label}</span>
                          </p>
                        </div>
                        <p>{resolved.assessment?.summary ?? 'This food has not been individually assessed in this guidance list.'}</p>
                        <a href={citation.url} target="_blank" rel="noreferrer">
                          Primary source: {citation.title}
                        </a>
                      </li>
                    )
                  })}
                </ul>
              </section>
            )
          })}
        </div>
        )}
      </section>
    </main>
  )
}
