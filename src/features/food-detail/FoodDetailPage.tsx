import { Link, useParams, useSearchParams } from 'react-router'
import { buildCatalogueQuery, parseCatalogueQuery, parsePreparationSlug } from '../../app/catalogueQuery'
import { GuidanceSection } from '../../components/GuidanceSection'
import { resolveAssessment } from '../../domain/assessment'
import { preparationIdsByCategoryId } from '../../domain/categoryTree'
import { createContentIndex } from '../../domain/contentIndex'
import type { ContentData } from '../../domain/contentValidation'
import type { Preparation } from '../../domain/schemas'

type FoodDetailPageProps = {
  content: ContentData
  disclaimer: string
}

export const FoodDetailPage = ({ content, disclaimer }: FoodDetailPageProps) => {
  const { foodSlug } = useParams()
  const [searchParams] = useSearchParams()
  const food = content.foods.find((candidate) => candidate.slug === foodSlug)

  if (!food) {
    return (
      <main className="page-content content-width" id="main-content" tabIndex={-1}>
        <h1>Food not found</h1>
        <p>This food is not in the current guide or may have been removed.</p>
        <Link to="/">Return to the food guide</Link>
      </main>
    )
  }

  const { state: queryState } = parseCatalogueQuery(
    searchParams,
    content.guidanceLists,
    new Set(content.categories.map((category) => category.slug)),
  )
  const selectedGuidanceLists = content.guidanceLists.filter((guidanceList) =>
    queryState.scopeSlugs.includes(guidanceList.slug),
  )
  const returnSearch = buildCatalogueQuery(queryState, content.guidanceLists).toString()
  const index = createContentIndex(content.categories, content.assessments)
  const openedPreparationSlug = parsePreparationSlug(searchParams, content.preparations)

  const preparationById = new Map(content.preparations.map((preparation) => [preparation.id, preparation]))
  const declared = [...content.preparations]
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .filter((preparation) => food.preparationIds.includes(preparation.id))
  // A reader asking about a preparation this food is not eaten in gets the group's authored answer
  // rather than silence, labelled as the group's rule rather than as advice about this food.
  const undeclared = (preparationIdsByCategoryId(content.foods, content.assessments, content.preparations)
    .get(food.primaryCategoryId) ?? [])
    .filter((preparationId) => !food.preparationIds.includes(preparationId))
    .map((preparationId) => preparationById.get(preparationId)!)
  // Validation guarantees the food's primary category exists, so its path is always in the tree.
  const breadcrumb = index.tree.pathByCategoryId.get(food.primaryCategoryId)!
    .map((category) => category.name)
    .join(' > ')

  const guidanceFor = (preparation?: Preparation) => selectedGuidanceLists.map((guidanceList) => (
    <GuidanceSection
      content={content}
      guidanceList={guidanceList}
      key={guidanceList.id}
      preparation={preparation}
      resolved={resolveAssessment({ kind: 'food', food }, guidanceList, index, preparation?.id)}
      returnSearch={returnSearch}
    />
  ))

  return (
    <main className="page-content content-width food-detail" id="main-content" tabIndex={-1}>
      <Link className="back-link" to={`/?${returnSearch}`}>Back to the food guide</Link>
      <p className="eyebrow">Food guidance</p>
      <h1>{food.name}</h1>
      <section aria-labelledby="guidance-heading">
        <h2 id="guidance-heading">Guidance</h2>
        {declared.length === 0 ? guidanceFor() : declared.map((preparation) => (
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

      {undeclared.length > 0 && (
        <section aria-labelledby="group-guidance-heading" className="group-guidance">
          <h2 id="group-guidance-heading">General guidance for {breadcrumb} applies:</h2>
          {undeclared.map((preparation) => (
            <section
              aria-labelledby={`group-preparation-${preparation.id}`}
              className="preparation-section"
              key={preparation.id}
            >
              <h3 id={`group-preparation-${preparation.id}`}>{preparation.name}</h3>
              {guidanceFor(preparation)}
            </section>
          ))}
        </section>
      )}

      <aside className="detail-disclaimer" aria-label="Medical information disclaimer">
        {disclaimer}
      </aside>
    </main>
  )
}

