import { Link, useParams, useSearchParams } from 'react-router'
import { buildCatalogueQuery, parseCatalogueQuery, parsePreparationSlug } from '../../app/catalogueQuery'
import { GuidanceSection } from '../../components/GuidanceSection'
import { resolveAssessment } from '../../domain/assessment'
import { categoryEntryRows } from '../../domain/categoryTree'
import type { ContentIndex } from '../../domain/contentIndex'
import type { Preparation } from '../../domain/schemas'

type CategoryDetailPageProps = {
  index: ContentIndex
  disclaimer: string
}

export const CategoryDetailPage = ({ index, disclaimer }: CategoryDetailPageProps) => {
  const { categorySlug } = useParams()
  const [searchParams] = useSearchParams()
  // The route always supplies the slug.
  const category = index.categoryBySlug(categorySlug!)

  if (!category || !index.isCategoryAssessed(category.id)) {
    return (
      <main className="page-content content-width" id="main-content" tabIndex={-1}>
        <h1>Category not found</h1>
        <p>This category is not an assessed part of the current guide or may have been removed.</p>
        <Link to="/">Return to the food guide</Link>
      </main>
    )
  }

  const { state: queryState } = parseCatalogueQuery(searchParams, index)
  const selectedGuidanceLists = index.guidanceLists.filter((guidanceList) =>
    queryState.scopeSlugs.includes(guidanceList.slug),
  )
  const returnSearch = buildCatalogueQuery(queryState, index).toString()
  const breadcrumb = index.tree.pathByCategoryId.get(category.id)!
    .map((candidate) => candidate.name)
    .join(' > ')

  const openedPreparationSlug = parsePreparationSlug(searchParams, index)
  // A category is a first-class subject, so its guidance has the same two axes a food's does. It
  // must be resolved per axis: resolving without a preparation deliberately ignores qualified
  // assessments, which would render not-assessed over authored rules.
  const axes = categoryEntryRows(index)
    .filter((row) => row.category.id === category.id)
    .map((row) => row.preparationId)
  const qualified = axes
    .filter((preparationId): preparationId is string => preparationId !== undefined)
    .map(index.preparationById)
  const hasUnqualified = axes.includes(undefined)

  const guidanceFor = (preparation?: Preparation) => selectedGuidanceLists.map((guidanceList) => (
    <GuidanceSection
      index={index}
      guidanceList={guidanceList}
      key={guidanceList.id}
      preparation={preparation}
      resolved={resolveAssessment({ kind: 'category', category }, guidanceList, index, preparation?.id)}
      returnSearch={returnSearch}
    />
  ))

  return (
    <main className="page-content content-width food-detail" id="main-content" tabIndex={-1}>
      <Link className="back-link" to={`/?${returnSearch}`}>Back to the food guide</Link>
      <p className="eyebrow">Category guidance</p>
      <p className="breadcrumb">{breadcrumb}</p>
      <h1>{category.name}</h1>
      <section aria-labelledby="guidance-heading">
        <h2 id="guidance-heading">Guidance</h2>
        {hasUnqualified && guidanceFor()}
        {qualified.map((preparation) => (
          <section
            aria-labelledby={`preparation-${preparation.id}`}
            className="preparation-section"
            key={preparation.id}
          >
            <h3 id={`preparation-${preparation.id}`}>
              {preparation.name}
              {preparation.slug === openedPreparationSlug && (
                <span className="preparation-opened"> - the preparation you were looking at</span>
              )}
            </h3>
            {guidanceFor(preparation)}
          </section>
        ))}
      </section>

      <aside className="detail-disclaimer" aria-label="Medical information disclaimer">
        {disclaimer}
      </aside>
    </main>
  )
}
