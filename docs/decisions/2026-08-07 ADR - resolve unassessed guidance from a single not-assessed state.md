# 2026-08-07 ADR: Resolve unassessed guidance from a single not-assessed state

**Status:** Proposed
**Date:** 2026-08-07
**Deciders:** Scott Dacre-Curtis

## Context and Problem Statement

Every guidance list currently declares a `coverage` block naming the categories and foods it claims
to cover. That declaration drives two grey fallback states. A subject inside the declared coverage
with no authored rule resolves to `Not assessed`; a subject outside it resolves to
`Outside current coverage`.

Both states mean the same thing to a reader: this guide has no reviewed rule for this food. The
difference between them is editorial bookkeeping about where a maintainer drew a boundary, and a
reader has to learn that bookkeeping to interpret what they are shown. Worse, the distinction is
unstable under ordinary content work: moving a food between categories can flip its label with no
change whatsoever in what the guide knows about it.

F-14 made that concrete. It re-parents fourteen foods out of a category that groups them by why they
were assessed rather than by what they are. Filing `Confectionery` and `Soups` as new root
categories flips every food beneath them from `Outside current coverage` to `Not assessed`, and the
only way to control which label appears is to edit a coverage list that Polly never sees.

Should the guide keep a declared coverage boundary and two grey states, or resolve every missing
rule to one honest `Not assessed` state?

## Considered Options

- Collapse to a single `Not assessed` state and remove the coverage declaration entirely.
- Collapse to a single `Not assessed` state but retain the coverage declaration purely as a
  build-time tripwire.
- Keep both states and manage the boundary by editing `coverage.categoryIds` per feature.

## Decision Outcome

Chosen option: "Collapse to a single `Not assessed` state and remove the coverage declaration
entirely", because the distinction between the two grey states was never meaningful to a reader, and
once it stops being displayed the declaration's only remaining job is a validation tripwire that
cannot catch the error it appears to guard against.

A guidance list no longer declares `coverage`. It declares an `unassessedNotice` carrying the
sentence and citations shown when no rule applies — the content today's `coverage.description` and
`coverage.citations` already hold. The `outside-coverage` outcome band, the `outOfCoverageStatusId`
field, and the containment validation are removed. Any subject with no own assessment and no
assessed ancestor resolves to the list's single grey `not-assessed` status.

Coverage is now derived, not declared: what a list covers is exactly the set of subjects it assesses.

### Consequences

- Good, because a reader meets one neutral state with one meaning, and never has to interpret a
  boundary drawn for maintainer convenience.
- Good, because a food's fallback label no longer changes when it is re-parented, so content
  restructuring such as F-12, F-13, and F-14 stops carrying incidental display consequences.
- Good, because authoring a new food or category no longer requires a matching coverage edit to
  avoid a misleading label, removing a step that is easy to forget and invisible when forgotten.
- Good, because the domain loses a whole concept: one fallback status per list, one grey outcome
  band, no containment rule, and no `all-catalogue` versus `category-subtrees-and-foods` mode.
- Bad, because validation no longer refuses an assessment authored for a subject the list's source
  never mentioned. That tripwire is genuinely lost, and mandatory human review of curated content
  under the AI-assisted curation ADR is the only remaining defence. This is accepted deliberately:
  the tripwire could only reject a rule outside a declared boundary, and a maintainer adding an
  out-of-scope rule can equally widen the boundary in the same commit.
- Bad, because every food in the catalogue now reads `Not assessed` in the vegetarian list rather
  than `Outside current coverage`, so the vegetarian list looks emptier and more incomplete than it
  did. That appearance is accurate.
- Neutral, because filtering result sets are unchanged. Coverage only ever selected which grey
  status a subject received; it never removed an entry from results, and the `not-assessed` band was
  already a non-primary filter.

## Decision Drivers

- A neutral state must be legible without product knowledge. Neither grey state means safe, and the
  medical-information disclaimer must remain the thing that says so.
- The application is unreleased, so the `v=1` URL contract can drop an outcome value rather than
  migrate it.
- Content restructuring is ongoing across F-12, F-13, and F-14. A model where re-parenting a food
  changes its displayed status is actively hostile to that work.
- Validation should fail on things it can actually detect. A rule that is checkable only against a
  boundary the same author controls is not a real check.

## Pros and Cons of the Options

### Collapse and remove the coverage declaration

- Good, because it removes the concept rather than hiding it, so no dormant field drifts out of step
  with the data.
- Good, because guidance lists become simpler to author: a status vocabulary, a citation policy, and
  a sentence for when nothing applies.
- Bad, because it gives up containment validation permanently, and restoring it later means
  re-declaring coverage across every list.

### Collapse but retain coverage as a build-time tripwire

- Good, because it keeps a guard against an assessment authored outside a source's scope.
- Bad, because the guard is weak by construction: the boundary and the rule are authored by the same
  person in the same commit, so widening the boundary to admit a bad rule is a one-line edit that
  reads as routine.
- Bad, because it keeps a field with no user-visible effect, which invites drift and demands upkeep
  in every content feature for a benefit nobody can see.

### Keep both grey states

- Good, because it preserves the distinction between "we mean to cover this and have not yet" and
  "this is out of scope", which has real editorial value to a maintainer.
- Bad, because that value accrues to maintainers while the cost is paid by every reader.
- Bad, because the distinction is derived from category ancestry, so it is decided by tree structure
  rather than by editorial intent, and it silently changes whenever the tree changes.

## Implementation Plan

- **Affected paths**: `src/domain/schemas.ts`, `src/domain/contentValidation.ts`,
  `src/domain/assessment.ts`, `src/domain/filtering.ts`, `src/app/catalogueQuery.ts`,
  `src/features/catalogue/CataloguePage.tsx`, `src/components/GuidanceSection.tsx`,
  `src/components/GuideEntrySummary.tsx`, `src/data/guidanceLists.ts`, `e2e/`, and their tests.
- **Pattern to follow**:
  - Replace `coverageDeclarationSchema` with an `unassessedNoticeSchema` of `description` and
    `citations`, and replace `coverage` on `guidanceListSchema` with `unassessedNotice`. Drop
    `outOfCoverageStatusId`.
  - Narrow the `outcomeBand` enum to `okay`, `maybe`, `not-okay`, `not-assessed`.
  - In `resolveAssessment`, replace the `isFoodCovered`/`isCategoryCovered` branch with the list's
    `unassessedStatusId`, and rename the `coverage-fallback` origin to `not-assessed`.
  - Delete `isFoodCovered`, `isCategoryCovered`, the containment check in `validateAssessments`, the
    distinct-fallback-status checks, and the coverage-reference checks in `validateGuidanceLists`.
    Keep the rule that an assessment must not use the fallback status.
  - Keep the citation-policy rules, retargeted at `unassessedNotice.citations`: a `required` list
    still needs at least one citation there and must not declare an `evidentiaryBasis`.
  - Remove the `Outside current coverage` status from both lists in `src/data/guidanceLists.ts` and
    move each list's coverage `description` and `citations` to its `unassessedNotice`. Reword the
    pregnancy sentence so it reads as a statement about this food having no reviewed rule rather
    than about a declared boundary.
  - Keep the URL contract at `v=1`. `outcome=outside-coverage` becomes an unknown value and is
    removed by the existing invalid-constraint handling and announced accessibly.
- **Tests**: `src/domain/assessment.test.ts`, `src/domain/contentValidation.test.ts`,
  `src/domain/filtering.test.ts`, `src/app/catalogueQuery.test.ts`,
  `src/features/food-detail/FoodDetailPage.test.tsx`,
  `src/features/catalogue/CataloguePage.test.tsx`, and the Playwright specs in `e2e/`. The existing
  outside-coverage assertions become single-fallback assertions rather than being deleted, so the
  collapse is proven rather than merely un-tested. Retain 100% statements, branches, functions, and
  lines for application source.

## Confirmation

- [ ] No guidance list declares `coverage`, and no `categoryIds`/`foodIds` containment list remains
      in `src/data/`.
- [ ] The `outcomeBand` enum has exactly four values and no status maps to `outside-coverage`.
- [ ] `GuidanceList` has one fallback status field, `unassessedStatusId`, and no
      `outOfCoverageStatusId`.
- [ ] A food with no own assessment and no assessed ancestor resolves to its list's grey
      `Not assessed` status regardless of which category it sits under.
- [ ] Re-parenting a food between two categories does not change its resolved status in any list.
- [ ] The string "Outside current coverage" appears nowhere in `src/`, `e2e/`, or rendered output.
- [ ] A list with `citationPolicy: 'required'` still fails validation when its `unassessedNotice`
      carries no citation, and a list with `citationPolicy: 'optional'` still requires an
      `evidentiaryBasis`.
- [ ] A shared URL containing `outcome=outside-coverage` loads with that constraint removed and the
      removal announced accessibly.
- [ ] The medical-information disclaimer still states that a neutral state does not mean safe.

## More Information

- Supersedes the distinct-fallback-band decision in
  [2026-08-06 ADR: show scoped guidance with generic outcome filters](<2026-08-06 ADR - show scoped guidance with generic outcome filters.md>),
  specifically its consequence that "missing assessments and outside-coverage states remain necessary
  domain fallbacks" and its verification criterion that missing assessments "resolve to distinct
  in-coverage and outside-coverage fallback states". The rest of that ADR — generic outcome bands,
  AND-across-scopes filtering, and the pregnancy default — stands unchanged.
- Amends
  [2026-08-05 ADR: remove temporal freshness metadata from guidance content](<2026-08-05 ADR - remove temporal freshness metadata from guidance content.md>),
  which retained "explicit coverage" alongside cited sources. Cited, precisely located sources are
  retained; the explicit coverage declaration is not.
- Relies on
  [2026-08-05 ADR: adopt AI-assisted local draft curation for official sources](<2026-08-05 ADR - adopt AI-assisted local draft curation for official sources.md>)
  for the mandatory human review that now carries the safeguard containment validation used to
  provide.
- Delivered by [F-15: Retire the outside-coverage state](<../features/15-retire-outside-coverage-state.md>),
  which unblocks [F-14: Retire the animal-derived ingredients category](<../features/14-retire-animal-derived-foods-category.md>).
