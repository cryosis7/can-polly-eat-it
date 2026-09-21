import type { GuidancePosition, ResolvedAssessment } from '../domain/assessment'
import type { Source } from '../domain/schemas'

/**
 * The positions that reached a status other than the one governing the entry. Empty unless assessed
 * sources disagree, so a single-source list never renders a dissent notice.
 */
const dissentingPositions = (resolved: ResolvedAssessment): GuidancePosition[] =>
  resolved.positions.filter((position) => position.status.id !== resolved.status.id)

// Validation requires a source on every assessment in a list declaring more than one, and a
// disagreement can only arise in such a list, so a dissenting position always names a known source.
const sourceOf = (position: GuidancePosition, sources: Source[]): Source =>
  sources.find((candidate) => candidate.id === position.sourceId)!

/** The place to read a dissenting source's own words: its cited passage, otherwise its home page. */
const readHref = (position: GuidancePosition, source: Source): string | undefined => {
  const nearest = position.layers[position.layers.length - 1]
  return nearest.citations.length > 0 ? nearest.citations[0].url : source.homeUrl
}

export type DissentNoticeProps = {
  resolved: ResolvedAssessment
  sources: Source[]
}

/**
 * States a disagreement in words wherever a contested status is shown. Disagreement is never
 * signalled by colour alone, and is never hidden behind a hover or an interaction a keyboard or
 * screen-reader user cannot reach.
 */
// ADR: Resolve guidance conservatively without inference.
// See: docs/decisions/2026-09-21 ADR - resolve guidance conservatively without inference.md
export const DissentNotice = ({ resolved, sources }: DissentNoticeProps) => (
  <>
    {dissentingPositions(resolved).map((position) => {
      const source = sourceOf(position, sources)
      const href = readHref(position, source)
      return (
        <p className="dissent-note" key={source.id}>
          {source.name} reached a different conclusion: {position.status.label}.
          {href !== undefined && (
            <>
              {' '}
              <a href={href} target="_blank" rel="noreferrer">Read {source.name}</a>
            </>
          )}
        </p>
      )
    })}
  </>
)
