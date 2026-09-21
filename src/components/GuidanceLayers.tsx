import { Link } from 'react-router'
import { assessmentSummary, type ResolvedAssessment } from '../domain/assessment'
import type { GuidanceList } from '../domain/schemas'
import { layerLabel } from './layerLabel'

export type GuidanceLayersProps = {
  guidanceList: GuidanceList
  resolved: ResolvedAssessment
  returnSearch: string
}

/**
 * Every authored layer that applies, in resolution order, each with its own summary and the scope it
 * was authored at.
 *
 * ADR: Resolve guidance conservatively without inference.
 * See: docs/decisions/2026-09-21 ADR - resolve guidance conservatively without inference.md
 *
 * The whole stack renders, never a chosen subset. A summary view that showed only some layers would
 * understate authored guidance — a species mercury limit disappearing behind its group's cooking
 * rule, for instance — and the status alone never substitutes for the words.
 */
export const GuidanceLayers = ({ guidanceList, resolved, returnSearch }: GuidanceLayersProps) => {
  if (resolved.layers.length === 0) {
    return <p>{guidanceList.unassessedNotice.description}</p>
  }

  // A label distinguishes one layer from another, or names where a single inherited layer came
  // from. A lone layer authored onto the subject itself has neither job, so it carries no label.
  const distinguishing = resolved.layers.length > 1

  return (
    <>
      {resolved.layers.map((layer) => (
        <div className="guidance-entry-layer" key={layer.assessment.id}>
          <p>{assessmentSummary(layer.assessment, guidanceList)}</p>
          {(distinguishing || layer.origin.kind === 'inherited') && (
            <p className="layer-scope">
              {layerLabel(layer)}
              {layer.origin.kind === 'inherited' && (
                <>
                  {' '}
                  <Link to={`/category/${layer.origin.category.slug}?${returnSearch}`}>
                    See {layer.origin.category.name} guidance
                  </Link>
                </>
              )}
            </p>
          )}
        </div>
      ))}
    </>
  )
}
