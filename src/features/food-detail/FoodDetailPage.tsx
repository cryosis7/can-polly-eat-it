import { Link, useParams, useSearchParams } from 'react-router'
import { buildCatalogueQuery, parseCatalogueQuery } from '../../app/catalogueQuery'
import { resolveAssessment } from '../../domain/assessment'
import type { ContentData } from '../../domain/contentValidation'

type FoodDetailPageProps = {
  content: ContentData
  disclaimer: string
}

const statusIcon = {
  green: 'OK',
  amber: '!',
  red: 'X',
  grey: '?',
} as const

// ADR: Link assessments to canonical reason foods.
// See: docs/decisions/2026-08-04 ADR - link assessments to canonical reason foods.md
export const FoodDetailPage = ({ content, disclaimer }: FoodDetailPageProps) => {
  const { foodSlug } = useParams()
  const [searchParams] = useSearchParams()
  const food = content.foods.find((candidate) => candidate.slug === foodSlug)

  if (!food) {
    return (
      <main className="page-content content-width">
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
  const guidanceList = content.guidanceLists.find((list) => list.slug === queryState.displayListSlug)!
  const resolved = resolveAssessment(food, guidanceList, content.assessments, content.categories)
  const returnSearch = buildCatalogueQuery(queryState, content.guidanceLists).toString()

  return (
    <main className="page-content content-width food-detail">
      <Link className="back-link" to={`/?${returnSearch}`}>Back to the food guide</Link>
      <p className="eyebrow">{guidanceList.title}</p>
      <h1>{food.name}</h1>
      <section aria-labelledby="guidance-heading" className="guidance-summary">
        <h2 id="guidance-heading">Guidance</h2>
        <p className={`status tone-${resolved.status.tone}`}>
          <span aria-hidden="true" className="status-icon">{statusIcon[resolved.status.tone]}</span>
          <span>{resolved.status.label}</span>
        </p>
        {resolved.assessment ? (
          <>
            <p>{resolved.assessment.summary}</p>
            <p>Reviewed: {resolved.assessment.reviewedOn}</p>
          </>
        ) : (
          <>
            <p>This food has not been individually assessed in this guidance list.</p>
            <p>{guidanceList.coverage.description}</p>
          </>
        )}
      </section>

      {resolved.assessment && (
        <>
          {resolved.assessment.guidanceScenarios.length > 0 && (
            <section aria-labelledby="scenarios-heading">
              <h2 id="scenarios-heading">How to follow this guidance</h2>
              {resolved.assessment.guidanceScenarios.map((scenario) => (
                <article className="guidance-scenario" key={scenario.id}>
                  <h3>{scenario.applicability}</h3>
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
                </article>
              ))}
            </section>
          )}

          {resolved.assessment.reasonLinks.length > 0 && (
            <section aria-labelledby="reasons-heading">
              <h2 id="reasons-heading">Why this guidance applies</h2>
              <ul className="reason-links">
                {resolved.assessment.reasonLinks.map((reason) => {
                  const targetFood = content.foods.find((candidate) => candidate.id === reason.targetFoodId)!
                  return (
                    <li key={`${reason.kind}-${reason.targetFoodId}`}>
                      {reason.statement} <Link to={`/food/${targetFood.slug}?v=1&list=${guidanceList.slug}`}>{targetFood.name}</Link>
                    </li>
                  )
                })}
              </ul>
            </section>
          )}

          <section aria-labelledby="sources-heading">
            <h2 id="sources-heading">Sources</h2>
            <ul className="source-links">
              {resolved.assessment.citations.map((citation) => (
                <li key={`${citation.url}-${citation.locator}`}>
                  <a href={citation.url} target="_blank" rel="noreferrer">{citation.title}</a>
                  <span> - {citation.locator} (accessed {citation.accessedOn})</span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      {!resolved.assessment && (
        <section aria-labelledby="sources-heading">
          <h2 id="sources-heading">Sources</h2>
          <ul className="source-links">
            {guidanceList.coverage.citations.map((citation) => (
              <li key={`${citation.url}-${citation.locator}`}>
                <a href={citation.url} target="_blank" rel="noreferrer">{citation.title}</a>
                <span> - {citation.locator} (accessed {citation.accessedOn})</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <aside className="detail-disclaimer" aria-label="Medical information disclaimer">
        {disclaimer}
      </aside>
    </main>
  )
}
