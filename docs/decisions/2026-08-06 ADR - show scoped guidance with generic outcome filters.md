# 2026-08-06 ADR: Show Scoped Guidance with Generic Outcome Filters

**Status:** Accepted
**Date:** 2026-08-06
**Deciders:** Project owner (requester)

## Context and Problem Statement

The guide currently asks the user to choose one guidance list to view, then filters by that list's
own status labels. After reviewing the planned experience, the desired mental model is closer to
"what can Polly eat under these dietary constraints?" than "which list am I looking at?". Pregnancy
should be selected by default, vegetarian suitability should be addable as another dietary scope, and
the primary filters should use generic outcome bands such as "Okay", "Maybe - see notes", and "Not
okay" rather than each list's bespoke status vocabulary.

How should the catalogue and URL state represent multiple selected guidance scopes while preserving
list-owned assessments, citations, coverage, and uncertainty?

## Considered Options

- Keep a single selected display list and per-list status filters.
- Show all guidance by default and filter by selected dietary scopes and generic outcome bands.
- Collapse pregnancy and vegetarian suitability into one global food status.

## Decision Outcome

Chosen option: "show all guidance by default and filter by selected dietary scopes and generic
outcome bands", because it matches the user's question while retaining the accepted independent-list
domain model. Pregnancy is selected by default. Additional dietary scopes such as vegetarian
suitability can be selected to narrow results. Generic outcome filters are ORed within the selected
outcome set and ANDed across selected guidance scopes.

### Consequences

- Good, because the default catalogue answers the pregnancy use case without forcing a list selector
  decision first.
- Good, because adding vegetarian suitability supports "pregnancy + vegetarian" filtering without
  duplicating foods or adding dietary booleans to `Food`.
- Good, because generic outcome filters provide one stable control vocabulary while each guidance
  list keeps its own display label, summary, citations, conditions, and review dates.
- Bad, because every list-owned status must be mapped to a generic outcome band and validators must
  enforce that mapping.
- Bad, because the UI must explain AND-across-scopes filtering clearly enough that users understand
  why a food can be excluded by one selected dietary scope.
- Bad, because missing assessments and outside-coverage states remain necessary domain fallbacks even
  if they are not primary user-facing filters.

## Decision Drivers

- The app is unreleased, so the existing `v=1&list=<display-list-slug>` URL contract can be replaced
  before launch rather than migrated.
- Food suitability remains contextual: pregnancy and vegetarian guidance must stay independent
  assessments against one canonical food catalogue.
- The user should see useful pregnancy guidance immediately on the first page load.
- Combined dietary filters should answer "satisfies every selected dietary scope", not "satisfies at
  least one selected scope".
- Missing data must not be interpreted as safe, even if incomplete guidance is normally hidden or
  deprioritised in the user interface.

## Pros and Cons of the Options

### Keep a single selected display list and per-list status filters

- Good, because it matches the current implementation in `src/app/catalogueQuery.ts` and
  `src/features/catalogue/CataloguePage.tsx`.
- Good, because every status label stays in its native list vocabulary.
- Bad, because the first interaction is choosing a list rather than answering Polly's combined
  dietary question.
- Bad, because pregnancy + vegetarian filtering remains harder to understand when status checkboxes
  are grouped by list-specific labels.

### Show all guidance by default and filter by selected dietary scopes and generic outcome bands

- Good, because pregnancy can be the default selected scope while vegetarian can be layered on as a
  second constraint.
- Good, because "Okay" plus "Maybe - see notes" across pregnancy and vegetarian scopes means a food
  must be one of those outcomes in both selected scopes.
- Good, because list-specific labels still render on cards and detail pages, preserving the nuance of
  "Only with conditions" versus "Check ingredients".
- Bad, because status definitions need an additional generic `outcomeBand` field.
- Bad, because the catalogue and URL parser need to be reworked around selected scopes rather than a
  selected display list.

### Collapse pregnancy and vegetarian suitability into one global food status

- Good, because the filter UI would be simple.
- Bad, because it contradicts the accepted independent-guidance-list model and cannot explain why a
  food is fine for one dietary context but unsuitable for another.
- Bad, because it would force future guidance perspectives into food-level fields or duplicated
  catalogues.

## Implementation Plan

- **Affected paths:** `docs/features/05-add-independent-guidance-lists.md`,
  `docs/implementation-plan.md`, `src/domain/schemas.ts`, `src/domain/contentValidation.ts`,
  `src/domain/assessment.ts`, `src/domain/filtering.ts`, `src/app/catalogueQuery.ts`,
  `src/data/guidanceLists.ts`, `src/data/assessments.ts`, `src/features/catalogue/`,
  `src/features/food-detail/`, and their tests.
- **Pattern to follow:** Keep `Food` and `Category` unchanged. Add a generic outcome band to each
  list-owned `StatusDefinition`, for example:
  `okay`, `maybe`, `not-okay`, `not-assessed`, and `outside-coverage`. Pregnancy's "OK to eat" maps
  to `okay`; "Only with conditions" maps to `maybe`; "Avoid" maps to `not-okay`. Vegetarian's
  "Vegetarian" maps to `okay`; "Check ingredients" maps to `maybe`; "Contains animal-derived
  ingredients" maps to `not-okay`. The list-owned grey fallback statuses remain distinct in the
  domain. The primary user filters show `okay`, `maybe`, and `not-okay`; incomplete guidance can be
  shown as a neutral state or a secondary maintainer/debug affordance rather than a default RAG
  checkbox.
- **URL state:** Because the app is unreleased, replace the existing `v=1` display-list URL contract
  before launch instead of supporting a migration. The new contract keeps URL state as product state
  and uses selected scopes plus generic outcomes, for example
  `?v=1&q=cheese&category=dairy&scope=pregnancy-food-safety,vegetarian-suitability&outcome=okay,maybe`.
  Pregnancy is the default `scope` when none is supplied. Unknown scopes or outcomes are removed and
  announced accessibly.
- **Filtering semantics:** Selected outcomes are alternatives within the outcome filter. Selected
  guidance scopes are cumulative constraints. A food appears only when, for every selected guidance
  scope, its resolved assessment maps to one of the selected generic outcome bands. If no outcome
  band is selected, the scope constrains coverage/display but does not narrow by outcome. Search and
  category filters keep their existing semantics.
- **Catalogue display:** Remove the primary "Guidance list" selector. Render guidance chips or rows
  for selected scopes on each food card. If multiple scopes are selected, make exclusions and active
  chips clear enough to explain that the food must satisfy each selected scope. Keep list-specific
  labels, citations, summaries, and non-colour status signals.
- **Food detail display:** Show all relevant guidance sections by default, with optional focus from
  catalogue context if needed. Do not infer one guidance list's status from another list or from a
  reason-link target.
- **Tests:** Update domain tests for outcome-band validation, fallback preservation, and AND-across
  selected scopes. Update query tests for the new unreleased URL contract. Update React Testing
  Library and Playwright coverage for default pregnancy scope, vegetarian-only filtering, pregnancy +
  vegetarian filtering with `okay` + `maybe`, unknown URL values, and all-guidance card/detail
  rendering.

## Confirmation

- [ ] `Food` has no pregnancy or vegetarian boolean/status fields.
- [ ] Every list-owned status maps to exactly one generic outcome band.
- [ ] The default catalogue has pregnancy selected when no scope appears in the URL.
- [ ] Selecting pregnancy and vegetarian with `okay` and `maybe` only shows foods whose resolved
      outcomes are `okay` or `maybe` in both selected scopes.
- [ ] Missing assessments still resolve to distinct in-coverage and outside-coverage fallback states
      and are never treated as `okay`.
- [ ] The old unreleased display-list URL contract has been replaced rather than migrated.
- [ ] Cards and detail pages retain list-specific labels, summaries, source links, conditions, review
      dates, and non-colour status signals.
- [ ] Unknown scopes, outcomes, or categories are removed from shared URLs and announced accessibly.

## More Information

This decision builds on
[2026-08-04 ADR: use independent guidance lists for food assessments](<2026-08-04 ADR - use independent guidance lists for food assessments.md>)
and keeps its one-catalogue, list-owned-assessment model. It supersedes that ADR's display-list URL
and status-filter pattern, but not its independent-list assessment model. It refines the catalogue
display, filter, and unreleased URL contract for
[F-05: Add Independent Guidance Lists](<../features/05-add-independent-guidance-lists.md>).
