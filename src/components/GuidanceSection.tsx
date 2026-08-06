import { Link } from 'react-router'
import type { ResolvedAssessment } from '../domain/assessment'
import type { ContentData } from '../domain/contentValidation'
import type { GuidanceList } from '../domain/schemas'

export type GuidanceSectionProps = {
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

// ADR: Link assessments to canonical reason foods.
// See: docs/decisions/2026-08-04 ADR - link assessments to canonical reason foods.md
export const GuidanceSection = ({
  guidanceList,
  resolved,
  content,
  returnSearch,
}: GuidanceSectionProps) => {
  const citations = resolved.assessment?.citations ?? guidanceList.coverage.citations

  return (
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
          <p>This item has not been individually assessed in this guidance list.</p>
          <p>{guidanceList.coverage.description}</p>
        </>
      )}
      {guidanceList.evidentiaryBasis && (
        <p className="evidentiary-basis">{guidanceList.evidentiaryBasis}</p>
      )}

      {resolved.origin.kind === 'inherited' && (
        <p className="inherited-note">
          {resolved.assessment!.scopeStatement}{' '}
          <Link to={`/category/${resolved.origin.category.slug}?${returnSearch}`}>
            See {resolved.origin.category.name} guidance
          </Link>
        </p>
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

      {citations.length > 0 && (
        <section aria-labelledby={`sources-${guidanceList.id}`}>
          <h4 id={`sources-${guidanceList.id}`}>Sources</h4>
          <ul className="source-links">
            {citations.map((citation) => (
              <li key={`${citation.url}-${citation.locator}`}>
                <a href={citation.url} target="_blank" rel="noreferrer">{citation.title}</a>
                <span> - {citation.locator}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  )
}
