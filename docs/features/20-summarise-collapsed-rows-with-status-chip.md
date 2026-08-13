# F-20: Summarise Collapsed Rows With an Aggregate Status Chip

**Status:** Done

**Depends on:** [F-11: Make the Browse Hierarchy Legible and Collapsible](<11-make-browse-hierarchy-legible.md>), [F-18: Model Preparation as a Catalogue Dimension](<18-model-preparation-as-a-catalogue-dimension.md>), [F-19: Make Preparation Bands Collapsible](<19-make-preparation-bands-collapsible.md>)

**Governing decisions:** [derive a display-only combined outcome for collapsed-row summaries](<../decisions/2026-08-13 ADR - derive a display-only combined outcome for collapsed-row summaries.md>), [use independent guidance lists for food assessments](<../decisions/2026-08-04 ADR - use independent guidance lists for food assessments.md>), [show scoped guidance with generic outcome filters](<../decisions/2026-08-06 ADR - show scoped guidance with generic outcome filters.md>), [resolve unassessed guidance from a single not-assessed state](<../decisions/2026-08-07 ADR - resolve unassessed guidance from a single not-assessed state.md>), [model preparation as a catalogue dimension](<../decisions/2026-08-10 ADR - model preparation as a catalogue dimension.md>), and [enforce WCAG 2.2 AA with axe-core in Playwright](<../decisions/2026-08-07 ADR - enforce WCAG 2.2 AA with axe-core in Playwright.md>)

## Goal

As Polly, I need a collapsed group to tell me at a glance whether there is anything inside it I need
to worry about, so that I can skip the groups that are uniformly fine and open the ones that are not,
instead of expanding every group to find out.

## Problem evidence

F-11 and F-19 made the browse view collapsible, and collapsed is now the resting state: top-level
groups start collapsed, and F-19 made preparation bands start collapsed too. That solved the scroll
problem — the unfiltered catalogue fell from 35,379px to 1,161px — but it moved every status out of
sight. A reader at rest now sees a list of names and entry counts carrying no guidance signal at all,
so the only way to learn that `Raw Meat and poultry` is uniformly `Avoid`, or that `Cereals` contains
one food that departs from its group rule, is to expand each one and read it.

## Primary experience

1. Land on the guide and expand a top-level group such as `Dairy`.
2. See `Hard cheese` collapsed, carrying a green `✓ OK` chip, and move past it without opening it.
3. See `Cereals` collapsed, carrying an orange `⚠ Maybe` chip, and understand that not all cereals can be assumed to be safe
4. Expand `Cereals` and find the nuance: the category rule and three foods say `OK to eat`, while
   `Fresh filled pasta` says `Only with conditions`.
5. See `Raw Meat and poultry` collapsed, carrying a red `✕ Avoid` chip, without needing to open it.

## Approved design artefact

The approved chip treatment is captured in
[20-collapsed-row-aggregate-chip-style.html](<artefacts/20-collapsed-row-aggregate-chip-style.html>).
It links the real `src/index.css` rather than duplicating the design tokens, so view it through the
dev server (`npm run dev`, then
`http://localhost:5173/docs/features/artefacts/20-collapsed-row-aggregate-chip-style.html`) rather
than opening the file directly. That keeps it honest: if a token changes, the artefact changes with
it instead of preserving a stale copy.

That artefact is normative for:

- the lozenge shape: a compact pill carrying one glyph and one word, distinct from the existing
  `StatusChip` used on expanded entries;
- the four states and their glyph/word pairs: `✓ OK`, `⚠ Maybe`, `✕ Avoid`, and `? Unknown`;
- the tone-to-colour mapping onto the existing `--status-*-soft` background and `--status-*` text
  tokens;
- placement inline immediately after the heading text and before the entry count, on both category
  headings and preparation bands.

It is **not** normative for the `.category-entry-count` styling it contains, which is illustrative:
this feature adds a real entry count to category headings, styled to match the existing
`.preparation-count`.

## Required behaviour

### Which rows carry a chip

- Every collapsed row below the root carries a chip: nested categories at any depth, and preparation
  bands at any depth.
- A root category (depth 0) never carries a chip, collapsed or not. A root group spans too much of the
  catalogue for one chip to say anything useful about it.
- A chip appears only while the row is collapsed. Expanding a row removes its chip, because the real
  per-entry statuses are then visible and the summary would compete with them.
- Collapsing a category hides its own guidance along with its descendants, exactly as collapsing a
  preparation band hides its callout. The chip already answers for the group, so restating the whole
  rule beneath it would say the same thing twice.
- Every browsable row is collapsible. A row renders only when it holds foods, holds its own guidance,
  or is an ancestor of a row that does, and collapsing now hides each of those.
- **A chip never summarises a filtered subset.** It either summarises the row's true, complete
  contents or it does not appear at all. While a search, category, or outcome filter is active, no
  chip is shown on any row. Selecting a further dietary scope is not filtering: it changes which
  guidance is shown, not which entries qualify, so it leaves both collapse state and chips intact.

### What the chip summarises

- The chip's entry set is the category's or band's **own guidance entry, where it has one, plus every
  descendant food and category entry hidden by the collapse**. The row's own rule participates as a
  peer entry alongside its foods; it is never merged into them.
- Each entry contributes exactly one status per active guidance list, taken from the existing
  `resolveAssessment` result for that entry. Inheritance, additive `adds-to` stacking, and
  multi-source contests are already resolved by the time the chip is computed, so the chip never
  re-derives them and never sees two statuses for one entry on one list.
- Each entry's statuses are then combined across the active guidance lists into one combined result
  for that entry, by the cross-list rule below.
- The chip is finally chosen by comparing those combined results across every entry in the set: if
  every entry's combined result is identical, the chip shows that result; if they differ in any way,
  the chip shows the orange `⚠ Maybe`.

### Combining one entry across active guidance lists

Applied in order, most cautious first:

1. If any active list resolves this entry to the `not-okay` outcome band, the combined result is
   `Avoid`.
2. Otherwise, if any active list resolves it to the `maybe` band, the combined result is `Maybe`.
3. Otherwise, if any active list resolves it to `not-assessed` while at least one other active list
   has resolved it to a real status, the combined result is `Maybe`. An unassessed entry is a
   caution, never a green light: a food may be unassessed simply because nobody has added a source
   for it yet, and presenting that as `OK` would imply an assurance no authority gave.
4. Otherwise, if every active list resolves it to the `okay` band, the combined result is `OK`.
5. Otherwise every active list resolved it to `not-assessed`, and the combined result is
   `Not assessed`.

### Presentation

- Exactly one chip is shown per collapsed row, however many guidance scopes are active. A chip per
  scope was considered and rejected: it crowds the row and, at three or more scopes, competes with the
  row name.
- The chip is a summary of what is hidden, never an authored status. It uses its own deliberately
  short vocabulary (`OK`, `Maybe`, `Avoid`, `Unknown`) precisely so it cannot be mistaken for a
  guidance list's own authored status label, which is always shown in full on the entries themselves.
- The chip carries a visible text word as well as a glyph and a tone, so status is never signalled by
  colour or icon alone.
- The chip is decorative to assistive technology only if its meaning is carried in the row's
  accessible name; otherwise it is exposed as text. Either way, a screen-reader user can determine the
  row's summarised state, its name, its expanded state, and its entry count.
- Category headings gain an entry count, worded plural-aware and styled to match the existing
  preparation-band count, so both row kinds present name, chip, and count consistently.

### Boundaries

- The chip is presentation only. It must not change the result count, the URL contract, which entries
  match a search or filter, guidance resolution, the set of layers rendered, or any authored wording.
- No status, summary, condition, scenario, or citation is merged, reworded, or invented. The chip
  derives a display-only summary from statuses that `resolveAssessment` already produced.
- The chip never resolves a status for an entry that has none. A `not-assessed` entry stays
  `not-assessed`; it is only ever combined with other entries' results, never given a status of its
  own.

## Non-goals

- Showing a chip on a root category, or on any expanded row.
- Showing more than one chip on a row, or attributing a chip to a particular guidance list.
- Changing `resolveAssessment`, the resolution order, additive stacking, multi-source contests, or any
  authored content.
- Changing the collapse defaults, the URL contract, filtering, searching, or the result count.
- Persisting anything new across sessions or encoding chip state in the URL.
- Distinguishing a uniformly-conditional subtree from a genuinely mixed one; see the accepted
  limitation below.
- Adding an entry count to root categories, or otherwise restyling root group headings.

## Assumptions and open questions

- This feature needed one new decision, now recorded in the
  [combined-outcome ADR](<../decisions/2026-08-13 ADR - derive a display-only combined outcome for collapsed-row summaries.md>).
  Combining statuses across guidance lists sits close to an option the generic-outcome-filters ADR
  explicitly rejected — a stored global food status — and to the repository rule against merging
  across lists. The ADR records why a render-time, display-only fold over generic outcome bands is
  permitted here and nowhere else. Everything else in this feature applies existing accepted ADRs:
  the independent-guidance-lists ADR already anticipated that "combined filters require documented
  semantics rather than an implicit global status", and the generic-outcome-filters ADR already
  established AND-across-scopes semantics, implemented today as an `.every()` over active lists in
  `src/domain/filtering.ts`.
- The cross-list combine is a display-time derivation only. It is never authored, never persisted, and
  never shown as a food's status: expanding the row still shows each list's own authored status
  separately and unmerged, exactly as it does today.
- **Accepted limitation, confirmed by the product owner:** a subtree in which every entry is uniformly
  `maybe` produces the same orange `⚠ Maybe` chip as a subtree whose entries genuinely differ. A
  reader cannot tell "everything in here needs cooking through" from "one of these is different"
  without expanding. This was seen in the browse-view render on the `Cooked Shellfish` band, which is
  uniformly `Only with conditions`, and accepted rather than solved: distinguishing the two would need
  a fifth chip state and a longer vocabulary, and both cases correctly tell the reader that the group
  needs their attention.
- Resolved by the product owner: no chip is shown while a search, category, or outcome filter is
  active. Searching `rice` narrows `Cereals` to one matching food, so a chip computed over the
  rendered rows would read `OK` and imply that everything filed under `Cereals` — including
  `Fresh filled pasta` — is okay to eat.
- Resolved by the product owner during implementation: selecting a further dietary scope is not
  filtering. It previously force-expanded the entire catalogue, which suppressed every chip in the
  multi-scope case the cross-list combine exists for. A scope changes which guidance is shown rather
  than which entries qualify, so it now leaves collapse state alone. See the implementation plan for
  the measurements and the accepted consequences for F-11 and F-19.
- Resolved by the product owner: root categories never carry a chip, at any collapse state.
- Resolved by the product owner: a uniformly not-assessed subtree does carry a chip, the grey
  `? Unknown` one, rather than showing nothing. Silence would be indistinguishable from a bug.
- Resolved by the product owner: the grey chip reads `Unknown`, not `Not assessed`, keeping the chip
  vocabulary to one word per state and distinct from the authored status label.
- Open: how the chip behaves on a very large subtree, such as the 59-entry cooked fish band. The
  computation is a fold over already-resolved statuses, so the budget is the same one F-11 accepted,
  but the implementation plan should confirm it is derived once per render rather than per row.

## Implementation plan

[F-20 Implementation Plan](<20-summarise-collapsed-rows-with-status-chip-plan.md>), blocked pending
ratification of the combined-outcome ADR.

## Acceptance criteria

- A collapsed non-root category whose entries all resolve alike shows that result's own chip; for
  example `Hard cheese` shows a green `OK` chip under the pregnancy scope alone.
- A collapsed non-root category whose entries do not all resolve alike shows the orange `Maybe` chip;
  for example `Cereals` shows `Maybe`, because `Fresh filled pasta` replaces the rule its three
  siblings inherit.
- Expanding that row reveals exactly the mixture the chip stood for, with every entry's own authored
  status, summary, and source unchanged from what it shows today.
- A collapsed preparation band carries a chip on the same rules as a category; for example
  `Raw Meat and poultry` shows a red `Avoid` chip.
- A collapsed subtree in which no entry is assessed on any active scope shows the grey `Unknown` chip.
- A root category shows no chip whether collapsed or expanded, and no row shows a chip while expanded.
- Collapsing a category such as `Hard cheese` hides its own guidance card as well as its foods, so the
  chip is the only answer on the row rather than sitting above a restatement of the same rule.
- Searching `rice` shows no chip on `Cereals`, so the guide never implies that everything under
  `Cereals` is okay to eat on the strength of one matching food.
- With two scopes active, a row still shows exactly one chip, and an entry that is `okay` on one
  scope and unassessed on the other contributes `Maybe` rather than `OK`.
- Collapsing or expanding any row leaves the announced result count, URL query string, selected
  filters, matched rows, and guidance resolution unchanged.
- A screen-reader user can determine a collapsed row's name, its summarised state, its expanded state,
  and its entry count; a sighted user reads the state as a word, not only as a colour or glyph.
- The implemented chip matches the approved design artefact's lozenge treatment, glyph/word pairs, and
  placement.

## Validation

React Testing Library tests for each combine rule, subtree uniformity, the peer participation of a
category's own guidance entry, root-category exclusion, chip absence when expanded, chip absence
under an active search or filter, the grey uniformly-unassessed case, multi-scope combination, and an
unchanged result count. Chromium Playwright
scenarios for the collapsed landing view, the `Cereals` mixed-chip case and its expansion, a
collapsed preparation band, and a `?q=rice` filtered URL showing no chip. Existing axe-core WCAG 2.2 AA scans and the repository-wide 100%
statements, branches, functions, and lines coverage for application source are retained. A subagent
runs the `prepare` skill after implementation and targeted validation, before this feature moves to
`Done`.

### Results

All gates passed:

- `npm run test:coverage` — 265 tests across 22 files; 100% statements, branches, functions, and lines
  retained.
- `npx playwright test` — 66 Chromium scenarios, including the axe-core WCAG 2.2 AA scans at both
  viewports with zero violations.
- `npm run typecheck` and `npm run lint` — clean.
- Measured: with both dietary scopes selected, catalogue height fell from 122,589px to 3,092px, with
  the announced result count unchanged at 202.

### Pre-merge `prepare` review

A subagent ran the `prepare` skill against the local branch diff against `main`. It found no
dependency-version issues and no missing documentation, and confirmed the cross-list fold is governed
by the combined-outcome ADR. It raised three documentation-drift findings, all caused by the narrowed
expansion behaviour and all now resolved: F-19's plan and brief, and F-11's brief and plan, each now
record that a bare dietary-scope selection is not a filter. `docs/architecture/overview.md` also
gained a description of the chip and its two folds.
