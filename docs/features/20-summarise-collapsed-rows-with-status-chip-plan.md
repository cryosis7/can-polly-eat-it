# F-20 Implementation Plan: Summarise Collapsed Rows With an Aggregate Status Chip

**Feature:** [F-20](<20-summarise-collapsed-rows-with-status-chip.md>)
**Status:** Implemented

**Governing decisions:** [derive a display-only combined outcome for collapsed-row summaries](<../decisions/2026-08-13 ADR - derive a display-only combined outcome for collapsed-row summaries.md>), [use independent guidance lists for food assessments](<../decisions/2026-08-04 ADR - use independent guidance lists for food assessments.md>), [show scoped guidance with generic outcome filters](<../decisions/2026-08-06 ADR - show scoped guidance with generic outcome filters.md>), [resolve unassessed guidance from a single not-assessed state](<../decisions/2026-08-07 ADR - resolve unassessed guidance from a single not-assessed state.md>), [model preparation as a catalogue dimension](<../decisions/2026-08-10 ADR - model preparation as a catalogue dimension.md>), and [enforce WCAG 2.2 AA with axe-core in Playwright](<../decisions/2026-08-07 ADR - enforce WCAG 2.2 AA with axe-core in Playwright.md>)

## Ratified gate

The combined-outcome ADR was accepted on 2026-08-13, unblocking this plan.

## Planning baseline

F-20 is presentation-only. It must not change the category tree, preparation vocabulary, assessment
resolution, filter predicates, result counting, detail routes, or the `v=1` URL contract. It adds one
derived value and one rendered element, and it changes no authored content.

The approved design artefact
[20-collapsed-row-aggregate-chip-style.html](<artefacts/20-collapsed-row-aggregate-chip-style.html>)
is normative for the lozenge treatment, the four glyph/word pairs, the tone mapping onto existing
`--status-*` tokens, and inline placement after the heading text and before the entry count. It links
the real `src/index.css`, so view it through the dev server rather than as a file. Its
`.category-entry-count` block is illustrative only.

Three product decisions are settled and must not be re-opened during implementation: root categories
never carry a chip; no chip renders while a search or filter is active; and a uniformly `maybe`
subtree is deliberately indistinguishable from a mixed one.

## Affected areas

- `src/domain/` — a new combined-outcome derivation beside `filtering.ts` and `assessment.ts`, plus
  the subtree fold that turns per-entry outcomes into one chip state.
- `src/features/catalogue/CataloguePage.tsx` — the category-heading and preparation-band render seams
  that already own collapse state, entry counts, and `resolveAssessment` calls.
- `src/components/` — a new chip component, kept separate from `StatusChip.tsx` so the authored-status
  presentation is not altered.
- `src/index.css` — the lozenge styling and the new category entry count.
- Existing catalogue component tests, domain tests, and Playwright catalogue scenarios.

## Implementation tasks

1. **Derive the combined outcome for one subject**
   - Add a pure function in `src/domain/` taking the resolved statuses for one subject across the
     active guidance lists and returning one `OutcomeBand`, implementing the ADR's five ordered rules.
   - Name the value and its type so "combined" travels with it; do not call it a status.
   - Add the ADR reference comment at the entry point, per the repository convention.
   - It must not call `resolveAssessment`, read `src/data/`, or import React, the router, or any
     browser API.
   - Unit-test each rule and its ordering, including `okay` + `not-assessed` yielding `maybe`, and
     all-`not-assessed` yielding `not-assessed` rather than `maybe`.

2. **Fold a collapsed row's entries into one chip state**
   - Add a derivation that collects every entry a collapsed row hides — its own guidance entry where
     it has one, plus every descendant food and category entry — and returns the chip state: the
     shared outcome where all entries agree, otherwise `maybe`.
   - The row's own guidance entry participates as a peer, never merged into its descendants.
   - Reuse the existing row/entry grouping already built in `categoryTree.ts` rather than re-walking
     the tree; the fold must be computed once per render, not per row per paint.
   - Unit-test uniform agreement, a single dissenting descendant, a dissenting own-entry, a
     preparation band, and a uniformly unassessed subtree.

3. **Render the chip**
   - Add a chip component rendering the lozenge from the approved artefact: pill, one glyph, one word
     (`OK`, `Maybe`, `Avoid`, `Unknown`), toned with the existing `--status-*-soft` and `--status-*`
     tokens.
   - Keep it separate from `StatusChip`, which continues to render authored per-entry statuses
     unchanged.
   - The word is always visible text, so meaning is never carried by colour or glyph alone.
   - Ensure the row's accessible name conveys the summarised state alongside the row name, expanded
     state, and entry count, without the chip being announced twice.

4. **Place the chip and add the category entry count**
   - Render the chip inline after the heading text and before the entry count, on collapsed non-root
     category headings and collapsed preparation bands.
   - Add a plural-aware entry count to category headings, styled to match the existing
     `.preparation-count`.
   - Suppress the chip on root categories, on expanded rows, on non-expandable rows, and whenever a
     search or filter is active.

5. **Hold the boundaries**
   - Collapsing or expanding must not change the announced result count, URL query string, selected
     filters, matched rows, guidance resolution, or the layers rendered.
   - No authored status, summary, condition, scenario, or citation is altered, reordered, or merged.
   - Expanding a row must reveal exactly the content it reveals today.

6. **Update focused automated coverage**
   - React Testing Library coverage for: each combine rule through the rendered chip; a uniform
     subtree; the `Cereals` mixed case; a category's own entry dissenting; root-category suppression;
     suppression while expanded; suppression under an active search and under an active filter; the
     grey uniformly-unassessed case; multi-scope combination; category entry-count wording; and an
     unchanged result count.
   - Chromium Playwright coverage for the collapsed landing view showing chips, the `Cereals` chip and
     its expansion revealing the dissenting entry, a collapsed preparation band, and `?q=rice`
     rendering no chip.
   - Existing axe-core WCAG 2.2 AA scans must remain green at both viewports.

7. **Run targeted validation**
   - `npm test -- src/domain/` for the new derivations, then
     `npm test -- src/features/catalogue/CataloguePage.test.tsx` for the render seam.
   - `npx playwright test e2e/catalogue.spec.ts` for the catalogue scenarios.
   - `npm run typecheck`, `npm run lint`, and `npm run test:coverage`, which must retain 100%
     statements, branches, functions, and lines for application source.

8. **Run the pre-merge prepare review**
   - After implementation and targeted validation, instruct a subagent to run the `prepare` skill
     against the local branch diff against `main`. The repository has no remote, no `origin`, no pull
     requests, and no CI.
   - Resolve every mechanical finding, or record an explicit accepted rationale here or in the brief,
     before marking F-20 `Done` or merging into `main`.

## Deviation from plan: scope selection stopped counting as filtering

Task 4 uncovered a defect in the existing build. `isFiltering` in `CataloguePage.tsx` treated any
non-default scope selection as filtering, and filtering force-expands every row holding content. With
two scopes selected the whole catalogue was therefore expanded — measured at 122,589px against
1,716px, with the result count unchanged at 202 — so no row was ever collapsed and no chip could ever
render. The cross-list combine, including the not-assessed-is-a-caution rule that motivated the ADR,
was unreachable in exactly the multi-scope case it was written for.

Auto-expansion exists so a search or filter never hides a matching row. A bare scope change matches
nothing new: with no outcome bands selected, `filterFoods` and `filterCategoryEntries` admit every
entry, which the unchanged 202 result count confirms. The expansion was therefore protecting nothing.

Resolved by the product owner after seeing both options rendered: a scope is a lens on the guidance
shown, not a filter on the rows, so `isFiltering` now covers only search, category, and outcome-band
filters. `hasActiveFilters` and the removable scope chip still treat a scope as active, so the Clear
button and the filter chips are unchanged.

Consequences accepted:

- F-11's and F-19's auto-expansion behaviour narrows. Their tests were re-run and one preparation-band
  test that had relied on a `dual` scope to expand a band for it now expands it explicitly, which is
  the more honest assertion.
- Multi-scope browsing keeps the reader's own collapse state, which is the behaviour F-11 already
  gives single-scope browsing.

## Deviation from plan: the filtered-subset guard is asserted, not coded

The plan implied a runtime guard suppressing chips while filtering. That guard proved unreachable:
under an active filter every rendered row has content, so `effectiveCollapsedIds` excludes it and it
renders expanded, and an expanded row is never chipped. Rather than keep a branch that can never
execute — which reads as a safeguard while being dead code, and would have broken the 100% branch
coverage gate — the invariant is asserted directly in the catalogue component tests and the Playwright
suite, and the reasoning is recorded in a comment at the seam.

## Done evidence to record

Recorded on completion:

- **Tasks 1–8 complete**, with two deviations documented above: the narrowed `isFiltering` predicate,
  and the filtered-subset invariant being asserted in tests rather than coded as an unreachable guard.
- **Targeted validation**, all passing:
  - `npx vitest run src/domain/collapsedRowSummary.test.ts` — 17 tests.
  - `npx vitest run src/features/catalogue/CataloguePage.test.tsx` — 56 tests.
  - `npm run test:coverage` — 265 tests across 22 files; 100% statements, branches, functions, and
    lines retained for application source.
  - `npx playwright test` — 66 Chromium scenarios, including the axe-core WCAG 2.2 AA scans at both
    viewports with zero violations.
  - `npm run typecheck` and `npm run lint` — clean.
- **Measured**: with both dietary scopes selected, catalogue height fell from 122,589px to 3,092px,
  with the result count unchanged at 202 before and after.
- **`prepare` subagent review**: no dependency-version findings and no missing-documentation findings;
  it confirmed the cross-list fold is governed by the new ADR and indexed. It raised three
  documentation-drift findings, all from the narrowed expansion behaviour, all now fixed:
  - F-19's plan said "outcome/scope filtering creates a result view" — corrected, with the narrowing
    recorded.
  - F-19's brief said "search and filters must not leave matching rows hidden" — clarified to search,
    category, and outcome filters.
  - F-11's brief and plan described filter-derived expansion without the scope exclusion — both now
    record it.
- Beyond the review's findings, `docs/architecture/overview.md` gained a description of the aggregate
  chip and its two folds, since the overview owns the catalogue's presentation contract.

