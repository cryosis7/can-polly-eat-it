import type { ResolvedAssessment } from '../domain/assessment'
import type { ContentIndex } from '../domain/contentIndex'
import type { GuidanceList } from '../domain/schemas'
import { DissentNotice } from './DissentNotice'
import { GuidanceLayers } from './GuidanceLayers'
import { StatusChip } from './StatusChip'

export type GuideEntrySummaryProps = {
  guidanceList: GuidanceList
  resolved: ResolvedAssessment
  index: ContentIndex
  returnSearch: string
}

/** A guide entry's whole answer in the catalogue: its status, then every layer behind it. */
export const GuideEntrySummary = ({ guidanceList, resolved, index, returnSearch }: GuideEntrySummaryProps) => (
  <section className="food-guidance">
    <h5>{guidanceList.title}</h5>
    <StatusChip status={resolved.status} />
    <GuidanceLayers guidanceList={guidanceList} resolved={resolved} returnSearch={returnSearch} />
    <DissentNotice index={index} resolved={resolved} />
  </section>
)
