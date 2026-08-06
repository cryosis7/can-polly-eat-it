import { Link, useParams, useSearchParams } from 'react-router'
import { buildCatalogueQuery, parseCatalogueQuery } from '../../app/catalogueQuery'
import { resolveAssessment, type ResolvedAssessment } from '../../domain/assessment'
import type { ContentData } from '../../domain/contentValidation'
import type { GuidanceList } from '../../domain/schemas'

type FoodDetailPageProps = {
  content: ContentData
  disclaimer: string
}

type GuidanceSectionProps = {
  guidanceList: GuidanceList
  resolved: ResolvedAssessment
  content: ContentData
  returnSearch: string
}

const statusIcon = {
  green: 'OK',
  amber: '!',
  red: 'X',
  grey: '?',
} as const

const GuidanceSection = ({
  guidanceList,
  resolved,
  content,
  returnSearch,
}: GuidanceSectionProps) => (
  <article aria-labelledby={`guidance-${guidanceList.id}`} className="guidance-summary">
    <h3 id={`guidance-${guidanceList.id}`}>{guidanceList.title}</h3>
    <p className={`status tone-${resolved.status.tone}`}>
      <span aria-hidden="true" className="status-icon">{statusIcon[resolved.status.tone]}</span>
      <span>{resolved.status.label}</span>
    </p>
    {resolved.assessment ? (
      <p>{resolved.assessment.summary}</p>
    ) : (
      <>
        <p>This food has not been individually assessed in this guidance list.</p>
        <p>{guidanceList.coverage.description}</p>
      </>
    )}

    {resolved.assessment && (
      <>
        {resolved.assessment.guidanceScenarios.length > 0 && (
          <section aria-labelledby={`scenarios-${guidanceList.id}`}>
            <h4 id={`scenarios-${guidanceList.id}`}>How to follow this guidance</h4>
            {resolved.assessment.guidanceScenarios.map((scenario) => (
              <section className="guidance-scenario" key={scenario.id}>
                <h5>{scenario.applicability}</h5>
                <p>{scenario.instruction}</p>
                {scenario.conditions.length > 0 && (
                  <ol>
                    {scenario.conditions.map((condition) => (
                      <li key={condition.id}>
                        <p>{condition.instruction}</p>
                        {condition.facts && (
                          <dl className="guidance-facts">
                            {condition.facts.map((fact) => (
                              <div key={fact.label}>
                                <dt>{fact.label}</dt>
                                <dd>{fact.valueText}</dd>
                              </div>
                            ))}
                          </dl>
                        )}
                      </li>
                    ))}
                  </ol>
                )}
              </section>
            ))}
          </section>
        )}

        {resolved.assessment.reasonLinks.length > 0 && (
          <section aria-labelledby={`reasons-${guidanceList.id}`}>
            <h4 id={`reasons-${guidanceList.id}`}>Why this guidance applies</h4>
            <ul className="reason-links">
              {resolved.assessment.reasonLinks.map((reason) => {
                const targetFood = content.foods.find((candidate) => candidate.id === reason.targetFoodId)!
                return (
                  <li key={`${reason.kind}-${reason.targetFoodId}`}>
                    {reason.statement} <Link to={`/food/${targetFood.slug}?${returnSearch}`}>{targetFood.name}</Link>
                  </li>
                )
              })}
            </ul>
          </section>
        )}
      </>
    )}

    <section aria-labelledby={`sources-${guidanceList.id}`}>
      <h4 id={`sources-${guidanceList.id}`}>Sources</h4>
      <ul className="source-links">
        {(resolved.assessment?.citations ?? guidanceList.coverage.citations).map((citation) => (
          <li key={`${citation.url}-${citation.locator}`}>
            <a href={citation.url} target="_blank" rel="noreferrer">{citation.title}</a>
            <span> - {citation.locator}</span>
          </li>
        ))}
      </ul>
    </section>
  </article>
)

// ADR: Link assessments to canonical reason foods.
// See: docs/decisions/2026-08-04 ADR - link assessments to canonical reason foods.md
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

  return (
    <main className="page-content content-width food-detail" id="main-content" tabIndex={-1}>
      <Link className="back-link" to={`/?${returnSearch}`}>Back to the food guide</Link>
      <p className="eyebrow">Food guidance</p>
      <h1>{food.name}</h1>
      <section aria-labelledby="guidance-heading">
        <h2 id="guidance-heading">Guidance</h2>
        {selectedGuidanceLists.map((guidanceList) => (
          <GuidanceSection
            content={content}
            guidanceList={guidanceList}
            key={guidanceList.id}
            resolved={resolveAssessment(food, guidanceList, content.assessments, content.categories)}
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
