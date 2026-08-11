import type { ResolvedAssessment } from '../domain/assessment'
import type { GuidanceList, Source } from '../domain/schemas'
import { DissentNotice } from './DissentNotice'
import { GuidanceLayers } from './GuidanceLayers'
import { StatusChip } from './StatusChip'

export type GuideEntrySummaryProps = {
  guidanceList: GuidanceList
  resolved: ResolvedAssessment
  sources: Source[]
  returnSearch: string
}

/** A guide entry's whole answer in the catalogue: its status, then every layer behind it. */
export const GuideEntrySummary = ({ guidanceList, resolved, sources, returnSearch }: GuideEntrySummaryProps) => (
  <section className="food-guidance">
    <h5>{guidanceList.title}</h5>
    <StatusChip status={resolved.status} />
    <GuidanceLayers guidanceList={guidanceList} resolved={resolved} returnSearch={returnSearch} />
    <DissentNotice resolved={resolved} sources={sources} />
  </section>
)
