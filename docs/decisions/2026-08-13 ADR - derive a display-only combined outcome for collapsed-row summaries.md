# 2026-08-13 ADR: Derive a display-only combined outcome for collapsed-row summaries

**Status:** Accepted
**Date:** 2026-08-13
**Deciders:** Scott Dacre-Curtis

## Context and Problem Statement

Browsing is now collapsed by default. F-11 collapsed top-level groups and F-19 collapsed preparation
bands, which cut the unfiltered catalogue from roughly 35,000px of scroll to about 1,200px but left a
reader at rest looking at names and counts carrying no guidance signal at all.

[F-20](../features/20-summarise-collapsed-rows-with-status-chip.md) puts a small aggregate chip on
each collapsed row so a reader can skip the groups that are uniformly fine and open the ones that are
not. The chip has to answer one question — "is there anything in here I need to worry about?" — and
that question is asked of the reader's whole dietary situation, not of one guidance list at a time. A
reader who has selected both pregnancy and vegetarian scopes wants one signal covering both.

That forces a combination across guidance lists, and this repository has deliberately refused such
combinations before. The 2026-08-06 generic-outcome-filters ADR considered and rejected "collapse
pregnancy and vegetarian suitability into one global food status", and
`.github/copilot-instructions.md` states that statuses must never be merged across guidance lists.
Both refusals exist to stop a food's contextual suitability being flattened into an intrinsic
property.

The same ADR, however, already mandates a cross-list combination for filtering: outcome bands are
ORed within the selected set and ANDed across selected scopes, implemented today in
`filtering.ts` as an `.every()` over the active lists. So the question is not whether guidance lists
may ever be combined — they already are — but whether that sanctioned combination may also drive a
displayed summary, and under what limits, so that a future agent reading a cross-list fold in
`src/domain/` does not conclude that merging guidance lists is generally acceptable.

## Considered Options

- Derive a display-only combined outcome, confined to collapsed-row summaries.
- Render one chip per active guidance list.
- Show no chip whenever more than one dietary scope is selected.

## Decision Outcome

Chosen option: "derive a display-only combined outcome, confined to collapsed-row summaries", because
it extends the AND-across-scopes semantics this repository already sanctions for filtering into the
one place a summary is genuinely needed, while every guarantee that made the *stored* global status
unacceptable stays intact: nothing is authored, nothing is persisted, no authored wording is touched,
and wherever a food's own guidance is displayed each list still speaks for itself.

The derivation combines only the generic `outcomeBand` of an already-resolved status. It never
combines summaries, scope statements, scenarios, conditions, citations, or sources, and it never
selects between authored wordings.

For one subject, across the active guidance lists, applied in order:

1. Any active list resolves to `not-okay` — combined `not-okay`.
2. Otherwise any active list resolves to `maybe` — combined `maybe`.
3. Otherwise any active list resolves to `not-assessed` while another has resolved a real status —
   combined `maybe`.
4. Otherwise every active list resolves to `okay` — combined `okay`.
5. Otherwise every active list resolves to `not-assessed` — combined `not-assessed`.

Rule 3 is the safety-critical one. An unassessed subject is unassessed because nobody has reviewed it
yet, which is not evidence that it is fine; combining `okay` with `not-assessed` down to `okay` would
manufacture an assurance no authority gave. Alcohol is the worked example: it carries no pregnancy
assessment in the current content, and no combination may present it as okay on the strength of a
different list's silence.

A collapsed row's chip is then chosen by comparing this combined outcome across every entry the
collapse hides, including the row's own guidance entry where it has one. Identical across all of them
yields that outcome's chip; any difference yields the `maybe` chip, meaning "mixed, open it".

### Consequences

- Good, because a reader gets one answer to the question they actually asked, covering every scope
  they selected, without opening groups that hold nothing relevant to them.
- Good, because the rule is stated once, in one place, rather than being re-derived ad hoc by each
  surface that wants a summary.
- Good, because rule 3 makes incomplete content read as caution rather than as permission, which is
  the safe direction for a health-guidance product to fail in.
- Bad, because a cross-list fold now exists in `src/domain/` and could be mistaken for a general
  licence to merge lists; this ADR and a naming convention that keeps the word "combined" attached to
  the value are the mitigations.
- Bad, because a subtree whose entries are uniformly `maybe` is indistinguishable from a genuinely
  mixed one, since both render the same chip. Accepted by the product owner: both correctly tell the
  reader the group needs attention, and separating them would need a fifth chip state.
- Bad, because adding a guidance list changes existing chips, as more lists mean more opportunities
  for rule 3 to apply. This is correct behaviour rather than drift, but it does mean chip snapshots
  are not stable across content additions.

## Decision Drivers

- A reader's dietary situation is the union of the scopes they selected, so a summary that answers
  only one of them answers the wrong question.
- Missing data must never be presented as safe, per the 2026-08-07 single not-assessed state ADR.
- A food's suitability stays contextual: the independent-guidance-list model must survive intact
  wherever real guidance is shown.
- The combination already exists for filtering, so inventing a second, differently-shaped one for
  display would be the greater inconsistency.
- Guidance wording is authored and reviewed, so no derivation may produce, alter, or select between
  sentences.

## Pros and Cons of the Options

### Derive a display-only combined outcome, confined to collapsed-row summaries

- Good, because it mirrors the AND-across-scopes rule already accepted for filtering.
- Good, because it is computed at render time from resolved statuses, so it cannot drift from the
  content or be mistaken for authored data.
- Good, because the chip disappears on expansion, so the combined value never sits beside the
  per-list statuses it summarises.
- Bad, because it introduces a derived value that resembles a status without being one, which needs
  naming discipline and this record to stay legible.

### Render one chip per active guidance list

- Good, because no combination happens at all, so the independent-list model is untouched.
- Good, because each list's own answer stays individually visible at rest.
- Bad, because the product owner rejected it on sight: two or more chips crowd the row and compete
  with the name, and at three or more lists the row stops being scannable.
- Bad, because it needs a per-chip list label to disambiguate, which is more machinery in the
  smallest, densest part of the view.

### Show no chip whenever more than one dietary scope is selected

- Good, because it sidesteps the question entirely.
- Bad, because it removes the feature precisely when a reader has the most constraints to track and
  the most to gain from a summary.
- Bad, because it makes the interface inconsistent for no reason the reader can perceive.

## Implementation Plan

- **Affected paths**: a new derivation in `src/domain/` beside `filtering.ts` and `assessment.ts`,
  consumed by `src/features/catalogue/CataloguePage.tsx`, with tests alongside each.
- **Pattern to follow**: the derivation takes already-resolved statuses and returns an `OutcomeBand`.
  It must not call `resolveAssessment` recursively, re-read `src/data/`, import React, the router, or
  any browser API, or touch `Assessment` bodies. Name the value and its type so that "combined"
  travels with it — a bare `status` or `outcomeBand` name would invite reuse as though it were
  authored. Add an ADR reference comment at the entry point, per the repository convention.
- **Tests**: unit tests in `src/domain/` covering each of the five rules and their ordering, with an
  explicit case for `okay` + `not-assessed` yielding `maybe`; component tests asserting the chip is
  absent from expanded rows and from any view with an active search or filter; the existing
  `migrationInvariant` and wording-preservation suites must stay green, proving no authored content
  moved.

## Confirmation

- [ ] The combined outcome is derived at render time and never written to `src/data/` or persisted.
- [ ] No `Food`, `Category`, or `Assessment` record gains a combined or global status field.
- [ ] The derivation reads only `outcomeBand` values and never merges authored summaries, scope
      statements, scenarios, conditions, citations, or sources.
- [ ] A subject that is `okay` on one active list and `not-assessed` on another combines to `maybe`.
- [ ] A subject that is `not-assessed` on every active list combines to `not-assessed`, not `maybe`.
- [ ] An expanded entry shows each active list's own authored status separately, unchanged by this
      ADR.
- [ ] No combined value renders anywhere other than a collapsed-row summary.
- [ ] `src/domain/` still imports no React, router, or browser module.

## More Information

- Constrained by
  [2026-08-04 ADR: use independent guidance lists for food assessments](<2026-08-04 ADR - use independent guidance lists for food assessments.md>),
  whose one-catalogue, list-owned-assessment model this decision leaves intact.
- Extends
  [2026-08-06 ADR: show scoped guidance with generic outcome filters](<2026-08-06 ADR - show scoped guidance with generic outcome filters.md>),
  which established the generic `outcomeBand` vocabulary and the AND-across-scopes rule. That ADR
  rejected "collapse pregnancy and vegetarian suitability into one global food status"; this decision
  does not revive it, because it stores nothing and changes nothing a food displays.
- Relies on
  [2026-08-07 ADR: resolve unassessed guidance from a single not-assessed state](<2026-08-07 ADR - resolve unassessed guidance from a single not-assessed state.md>)
  for the meaning of `not-assessed`, which rule 3 preserves by treating it as a caution.
- Delivered by [F-20: Summarise collapsed rows with an aggregate status chip](../features/20-summarise-collapsed-rows-with-status-chip.md).
