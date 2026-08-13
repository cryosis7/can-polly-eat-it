import { combinedOutcomePresentation, type CombinedOutcome } from '../domain/collapsedRowSummary'

// ADR: Derive a display-only combined outcome for collapsed-row summaries.
// See: docs/decisions/2026-08-13 ADR - derive a display-only combined outcome for collapsed-row summaries.md
/**
 * The summary lozenge on a collapsed row. Deliberately separate from `StatusChip`, which renders a
 * guidance list's own authored status on an entry: this one summarises what a collapse is hiding,
 * uses a shorter vocabulary that belongs to no list, and never appears beside the statuses it stands
 * for.
 *
 * The row's own control carries the state in its accessible name, so the chip is hidden from
 * assistive technology to avoid announcing it twice. The word is still visible text, so a sighted
 * reader never has to read meaning from the colour or the glyph alone.
 */
export const CollapsedRowChip = ({ outcome }: { outcome: CombinedOutcome }) => {
  const { tone, icon, label } = combinedOutcomePresentation[outcome]
  return (
    <span aria-hidden="true" className={`aggregate-chip tone-${tone}`}>
      <span className="aggregate-chip-icon">{icon}</span>
      {label}
    </span>
  )
}
