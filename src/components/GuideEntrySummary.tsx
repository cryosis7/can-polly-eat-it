import { Link } from 'react-router'
import type { ResolvedAssessment } from '../domain/assessment'
import type { GuidanceList } from '../domain/schemas'

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
  const citations = resolved.assessment?.citations ?? guidanceList.coverage.citations

  return (
    <section className="food-guidance">
      <h5>{guidanceList.title}</h5>
      <p className={`status tone-${resolved.status.tone}`}>
        <span aria-hidden="true" className="status-icon">{statusIcon[resolved.status.tone]}</span>
        <span>{resolved.status.label}</span>
      </p>
      <p>{resolved.assessment?.summary ?? 'This food has not been individually assessed in this guidance list.'}</p>
      {resolved.origin.kind === 'inherited' && (
        <p className="inherited-note">
          {resolved.assessment!.scopeStatement}{' '}
          <Link to={`/category/${resolved.origin.category.slug}?${returnSearch}`}>
            See {resolved.origin.category.name} guidance
          </Link>
        </p>
      )}
      {citations.length > 0 && (
        <a href={citations[0].url} target="_blank" rel="noreferrer">
          Primary source: {citations[0].title}
        </a>
      )}
    </section>
  )
}
