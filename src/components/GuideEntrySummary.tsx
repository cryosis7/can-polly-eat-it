import { Link } from 'react-router'
import type { AssessmentOrigin, GuidanceLayer, ResolvedAssessment } from '../domain/assessment'
import type { GuidanceList } from '../domain/schemas'

type InheritedLayer = GuidanceLayer & { origin: Extract<AssessmentOrigin, { kind: 'inherited' }> }

const isInheritedLayer = (layer: GuidanceLayer): layer is InheritedLayer => layer.origin.kind === 'inherited'

export type GuideEntrySummaryProps = {
  guidanceList: GuidanceList
  resolved: ResolvedAssessment
  returnSearch: string
}

const statusIcon = {
  green: 'OK',
  amber: '!',
  red: 'X',
  grey: '?',
} as const

export const GuideEntrySummary = ({ guidanceList, resolved, returnSearch }: GuideEntrySummaryProps) => {
  const citations = resolved.assessment?.citations ?? guidanceList.unassessedNotice.citations
  // Every layer before the last is an ancestor category, because the nearest assessment is ordered
  // last. Each accumulated layer states its own authored summary; layers are never merged.
  const accumulatedLayers = resolved.layers.slice(0, -1).filter(isInheritedLayer)

  return (
    <section className="food-guidance">
      <h5>{guidanceList.title}</h5>
      <p className={`status tone-${resolved.status.tone}`}>
        <span aria-hidden="true" className="status-icon">{statusIcon[resolved.status.tone]}</span>
        <span>{resolved.status.label}</span>
      </p>
      <p>{resolved.assessment?.summary ?? guidanceList.unassessedNotice.description}</p>
      {resolved.origin.kind === 'inherited' && (
        <p className="inherited-note">
          {resolved.assessment!.scopeStatement}{' '}
          <Link to={`/category/${resolved.origin.category.slug}?${returnSearch}`}>
            See {resolved.origin.category.name} guidance
          </Link>
        </p>
      )}
      {accumulatedLayers.map(({ assessment, origin }) => (
        <p className="accumulated-note" key={assessment.id}>
          {assessment.summary}{' '}
          <Link to={`/category/${origin.category.slug}?${returnSearch}`}>
            See {origin.category.name} guidance
          </Link>
        </p>
      ))}
      {citations.length > 0 && (
        <a href={citations[0].url} target="_blank" rel="noreferrer">
          Primary source: {citations[0].title}
        </a>
      )}
    </section>
  )
}
