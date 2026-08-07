# F-15: Retire the Outside-Coverage State

**Status:** Proposed

**Depends on:** [F-08: Rework Guidance-Scope Filtering](<08-rework-guidance-scope-filtering.md>), [F-12: Lift Group-Level Guidance onto Categories](<12-lift-group-guidance-onto-categories.md>), [F-13: Surface Raw-Egg Foods Where People Browse for Them](<13-surface-raw-egg-foods.md>)

**Governing decisions:** [resolve unassessed guidance from a single not-assessed state](<../decisions/2026-08-07 ADR - resolve unassessed guidance from a single not-assessed state.md>), [show scoped guidance with generic outcome filters](<../decisions/2026-08-06 ADR - show scoped guidance with generic outcome filters.md>), [use independent guidance lists for food assessments](<../decisions/2026-08-04 ADR - use independent guidance lists for food assessments.md>), and [assess categories as first-class subjects with inherited guidance](<../decisions/2026-08-06 ADR - assess categories as first-class subjects with inherited guidance.md>)

## Goal

As Polly, I need one plain answer when a guide has nothing to tell me about a food, so that I am not
asked to work out the difference between two grey states that both mean the same thing.

## Problem evidence

Every guidance list declares a `coverage` block naming the categories and foods it claims. That
declaration produces two grey states with identical meaning to a reader:

- `Wine and beer` reads `Outside current coverage` in the pregnancy list.
- `Butter` reads `Not assessed` in the pregnancy list.

Neither has a reviewed pregnancy rule. The only difference is whether a maintainer's declaration
happens to name an ancestor category, which Polly cannot see and has no reason to reason about.

The distinction is also unstable. Coverage containment is resolved by walking a subject's ancestor
path, so re-parenting a food can flip its label with no change in what the guide knows. F-13 must add
`desserts` and `drinks` to the pregnancy coverage purely to stop moved ice-cream entries reading as
out of coverage, and F-14 cannot file foods under new root categories without either editing coverage
or accepting a misleading label. Two features are paying a tax for a distinction that serves nobody.

## Primary experience

1. Open any food with no reviewed rule in the selected guide and read a single `Not assessed` state.
2. Read, alongside it, the guide's own sentence about what it covers and its source link, so the
   absence is explained rather than bare.
3. Read the medical-information disclaimer and understand that `Not assessed` does not mean safe.
4. Filter, browse, and search exactly as before, with the same entries returned.

## Required behaviour

- A guidance list no longer declares `coverage`. It declares an `unassessedNotice` carrying the
  sentence and citations shown when no rule applies, holding the content today's
  `coverage.description` and `coverage.citations` already carry.
- The `outside-coverage` generic outcome band, the `outOfCoverageStatusId` field, and every
  `Outside current coverage` status are removed from the domain, the data, and the UI.
- Any subject with no own assessment and no assessed ancestor in the selected list resolves to that
  list's single grey `not-assessed` status, whatever category it sits under.
- Coverage-containment validation is removed. An assessment is no longer required to sit inside a
  declared boundary, and no `all-catalogue` or `category-subtrees-and-foods` mode remains.
- Every other content-validation rule is retained unchanged: an assessment must not use a fallback
  status, a category assessment needs a `scopeStatement` and a food assessment must not have one, no
  subject is assessed twice in one list, and identifiers and slugs stay unique.
- Citation-policy rules are retained, retargeted at `unassessedNotice`. A `required` list still needs
  at least one citation there and must not declare an `evidentiaryBasis`; an `optional` list must
  still declare one.
- No assessment's status, summary, conditions, scenarios, citations, or reason links change. This
  feature changes only what is displayed when *no* assessment applies.
- The URL contract stays at `v=1`. `outcome=outside-coverage` becomes an unknown value, is removed
  by the existing invalid-constraint handling, and the removal is announced accessibly.
- The pregnancy list's notice sentence is reworded to read as a statement about this food having no
  reviewed rule, rather than about a declared boundary, since there is no longer a boundary to
  describe.
- Filter controls, chips, and the result count continue to label every state, and `Not assessed`
  remains a neutral non-primary band rather than a RAG filter.

## Non-goals

- Authoring, rewording, re-sourcing, or removing any reviewed guidance.
- Adding or removing any food or category record.
- Changing search, category filtering, browse hierarchy, or the result-count contract.
- Introducing a replacement safeguard for the containment check. The governing ADR accepts that
  mandatory human review carries this, and adding a new maintainer-facing gate is separate work.
- Reporting which foods still lack a rule. That is a maintainer-tooling idea, not this feature.
- Bumping the URL contract version.

## Assumptions and open questions

- The governing ADR is drafted and must be accepted before this feature moves to `Planned`. It
  supersedes the distinct-fallback-band decision in the outcome-filters ADR and amends the
  explicit-coverage wording in the freshness-metadata ADR.
- F-12 and F-13 are prerequisites for sequencing rather than logic. Both are in flight and both touch
  `src/data/guidanceLists.ts` coverage; landing this first would force them to be re-planned
  mid-implementation. F-13's requirement to add `desserts` and `drinks` to
  `coverage.categoryIds` becomes unnecessary once this ships, and F-13's brief should be updated to
  note that rather than being blocked by it.
- F-08 is a dependency because it established the generic outcome bands and the `outcome=` URL
  contract that this feature narrows.
- Accepted consequence: every food in the catalogue now reads `Not assessed` in the vegetarian list
  rather than `Outside current coverage`, so that list will look sparser. It is not: it is being
  honest about how few foods it assesses.
- Accepted consequence: validation no longer refuses an assessment authored for a subject the list's
  source never named. This is stated in the ADR and is deliberate.
- The existing outside-coverage assertions in the domain, component, and Playwright suites are
  rewritten as single-fallback assertions rather than deleted, so the collapse is proven.
- Open: whether the notice sentence should render on a card as well as on a detail page. Today
  `GuideEntrySummary` uses the coverage citations but not the description; keeping that split is the
  default and any change should be justified by review rather than by the refactor.

## Acceptance criteria

- A food with no reviewed rule shows `Not assessed` in the selected guide, and the phrase
  `Outside current coverage` appears nowhere in the application, its tests, or its rendered output.
- Moving a food from one category to another does not change its resolved status in any guidance
  list.
- A guidance list declares no `coverage` block, no `categoryIds` or `foodIds` containment list, and a
  single fallback status.
- A food with no rule displays the guide's notice sentence and source link alongside the neutral
  state, and the medical-information disclaimer still states that a neutral state does not mean safe.
- Every food and category that had an authored assessment before the change displays the identical
  status, summary, conditions, scenarios, citations, and reason links after it.
- Filtering by any scope and outcome combination returns the same guide entries and the same result
  count as before, except that `outcome=outside-coverage` is no longer a valid value.
- Loading a shared URL containing `outcome=outside-coverage` removes only that constraint and
  announces the removal accessibly.
- Content validation still fails on a fallback status used by an assessment, a category assessment
  without a `scopeStatement`, a food assessment with one, a duplicate subject/list pair, an unknown
  reference, and a `required` list whose notice carries no citation.

## Validation

Domain unit tests for single-state fallback resolution, re-parenting stability, and every retained
validation rule, including the removal of the containment and distinct-fallback checks. Content
validation tests over the real authored data. React Testing Library tests for a food detail page and
a catalogue card in the unassessed state, and for the filter controls no longer offering an
outside-coverage band. `catalogueQuery` tests for the unknown `outcome=outside-coverage` value being
dropped and announced. Chromium Playwright coverage for a food with no rule and for a shared URL
carrying the retired outcome value, plus the existing WCAG 2.2 AA axe-core scans. Repository-wide
100% statements, branches, functions, and lines coverage for application source is retained. A
subagent runs the `prepare` skill after implementation and targeted validation, before the pull
request is opened and before this feature moves to `Done`.
