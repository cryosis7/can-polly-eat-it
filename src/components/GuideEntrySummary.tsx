import { Link } from 'react-router'
import { assessmentSummary, type AssessmentOrigin, type GuidanceLayer, type ResolvedAssessment } from '../domain/assessment'
import type { GuidanceList, Source } from '../domain/schemas'
import { DissentNotice } from './DissentNotice'

type InheritedLayer = GuidanceLayer & { origin: Extract<AssessmentOrigin, { kind: 'inherited' }> }

const isInheritedLayer = (layer: GuidanceLayer): layer is InheritedLayer => layer.origin.kind === 'inherited'

export type GuideEntrySummaryProps = {
  guidanceList: GuidanceList
  resolved: ResolvedAssessment
  sources: Source[]
  returnSearch: string
}

const statusIcon = {
  green: 'OK',
  amber: '!',
  red: 'X',
  grey: '?',
} as const

export const GuideEntrySummary = ({ guidanceList, resolved, sources, returnSearch }: GuideEntrySummaryProps) => {
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
      <p>
        {resolved.assessment
          ? assessmentSummary(resolved.assessment, guidanceList)
          : guidanceList.unassessedNotice.description}
      </p>
      <DissentNotice resolved={resolved} sources={sources} />
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
          {assessmentSummary(assessment, guidanceList)}{' '}
          <Link to={`/category/${origin.category.slug}?${returnSearch}`}>
            See {origin.category.name} guidance
          </Link>
        </p>
      ))}
    </section>
  )
}
