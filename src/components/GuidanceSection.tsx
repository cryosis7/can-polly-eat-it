import { Link } from 'react-router'
import type { GuidanceLayer, ResolvedAssessment } from '../domain/assessment'
import type { ContentData } from '../domain/contentValidation'
import type { GuidanceList, SourceCitation } from '../domain/schemas'

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

const dedupeCitations = (citations: SourceCitation[]) => {
  const seen = new Set<string>()
  return citations.filter((citation) => {
    const key = `${citation.url}-${citation.locator}`
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

type LayerBodyProps = {
  layer: GuidanceLayer
  content: ContentData
  headingId: string
  returnSearch: string
  isAccumulated: boolean
}

// ADR: Accumulate inherited guidance through additive assessments.
// See: docs/decisions/2026-08-07 ADR - accumulate inherited guidance through additive assessments.md
const LayerBody = ({ layer, content, headingId, returnSearch, isAccumulated }: LayerBodyProps) => {
  const { assessment, origin } = layer
  const ScenarioHeading = isAccumulated ? 'h6' : 'h5'

  return (
    <>
      {origin.kind === 'inherited' && (
        <p className="inherited-note">
          {assessment.scopeStatement}{' '}
          <Link to={`/category/${origin.category.slug}?${returnSearch}`}>
            See {origin.category.name} guidance
          </Link>
        </p>
      )}

      {assessment.guidanceScenarios.length > 0 && (
        <section aria-labelledby={`scenarios-${headingId}`}>
          <h4 id={`scenarios-${headingId}`}>
            {isAccumulated && assessment.guidanceScenarios.length > 1
              ? 'Follow whichever applies'
              : 'How to follow this guidance'}
          </h4>
          {assessment.guidanceScenarios.map((scenario) => (
            <section className="guidance-scenario" key={scenario.id}>
              <ScenarioHeading>{scenario.applicability}</ScenarioHeading>
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

      {assessment.reasonLinks.length > 0 && (
        <section aria-labelledby={`reasons-${headingId}`}>
          <h4 id={`reasons-${headingId}`}>Why this guidance applies</h4>
          <ul className="reason-links">
            {assessment.reasonLinks.map((reason) => {
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
  )
}

// ADR: Link assessments to canonical reason foods.
// See: docs/decisions/2026-08-04 ADR - link assessments to canonical reason foods.md
export const GuidanceSection = ({
  guidanceList,
  resolved,
  content,
  returnSearch,
}: GuidanceSectionProps) => {
  const citations = resolved.layers.length > 0
    ? dedupeCitations(resolved.layers.flatMap((layer) => layer.assessment.citations))
    : guidanceList.coverage.citations
  const isAccumulated = resolved.layers.length > 1

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

      {isAccumulated ? (
        <section aria-labelledby={`layers-${guidanceList.id}`} className="guidance-layers">
          <h4 id={`layers-${guidanceList.id}`}>All of the following apply</h4>
          {resolved.layers.map((layer) => (
            <section aria-labelledby={`layer-${guidanceList.id}-${layer.assessment.id}`} className="guidance-layer" key={layer.assessment.id}>
              <h5 id={`layer-${guidanceList.id}-${layer.assessment.id}`}>
                {layer.assessment.scopeStatement ?? 'Specific to this food'}
              </h5>
              <p>{layer.assessment.summary}</p>
              <LayerBody
                content={content}
                headingId={`${guidanceList.id}-${layer.assessment.id}`}
                isAccumulated
                layer={layer}
                returnSearch={returnSearch}
              />
            </section>
          ))}
        </section>
      ) : resolved.layers.length === 1 && (
        <LayerBody
          content={content}
          headingId={guidanceList.id}
          isAccumulated={false}
          layer={resolved.layers[0]}
          returnSearch={returnSearch}
        />
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
