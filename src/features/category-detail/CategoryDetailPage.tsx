import { Link, useParams, useSearchParams } from 'react-router'
import { buildCatalogueQuery, parseCatalogueQuery } from '../../app/catalogueQuery'
import { GuidanceSection } from '../../components/GuidanceSection'
import { resolveAssessment } from '../../domain/assessment'
import { createContentIndex } from '../../domain/contentIndex'
import type { ContentData } from '../../domain/contentValidation'

type CategoryDetailPageProps = {
  content: ContentData
  disclaimer: string
}

export const CategoryDetailPage = ({ content, disclaimer }: CategoryDetailPageProps) => {
  const { categorySlug } = useParams()
  const [searchParams] = useSearchParams()
  const category = content.categories.find((candidate) => candidate.slug === categorySlug)
  const index = createContentIndex(content.categories, content.assessments)

  if (!category || !index.assessedCategoryIds.has(category.id)) {
    return (
      <main className="page-content content-width" id="main-content" tabIndex={-1}>
        <h1>Category not found</h1>
        <p>This category is not an assessed part of the current guide or may have been removed.</p>
        <Link to="/">Return to the food guide</Link>
      </main>
    )
  }

  const { state: queryState } = parseCatalogueQuery(
    searchParams,
    content.guidanceLists,
    new Set(content.categories.map((candidate) => candidate.slug)),
  )
  const selectedGuidanceLists = content.guidanceLists.filter((guidanceList) =>
    queryState.scopeSlugs.includes(guidanceList.slug),
  )
  const returnSearch = buildCatalogueQuery(queryState, content.guidanceLists).toString()
  const breadcrumb = index.tree.pathByCategoryId.get(category.id)!
    .map((candidate) => candidate.name)
    .join(' > ')

  return (
    <main className="page-content content-width food-detail" id="main-content" tabIndex={-1}>
      <Link className="back-link" to={`/?${returnSearch}`}>Back to the food guide</Link>
      <p className="eyebrow">Category guidance</p>
      <p className="breadcrumb">{breadcrumb}</p>
      <h1>{category.name}</h1>
      <section aria-labelledby="guidance-heading">
        <h2 id="guidance-heading">Guidance</h2>
        {selectedGuidanceLists.map((guidanceList) => (
          <GuidanceSection
            content={content}
            guidanceList={guidanceList}
            key={guidanceList.id}
            resolved={resolveAssessment({ kind: 'category', category }, guidanceList, index)}
            returnSearch={returnSearch}
          />
        ))}
      </section>

      <aside className="detail-disclaimer" aria-label="Medical information disclaimer">
        {disclaimer}
      </aside>
    </main>
  )
}
