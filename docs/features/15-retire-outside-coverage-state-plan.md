# F-15 Implementation Plan: Retire the Outside-Coverage State

**Feature:** [F-15: Retire the Outside-Coverage State](<15-retire-outside-coverage-state.md>)
**Status:** Approved
**Governing decision:** [resolve unassessed guidance from a single not-assessed state](<../decisions/2026-08-07 ADR - resolve unassessed guidance from a single not-assessed state.md>)

The governing ADR specifies the schema change, the resolver change, the validation rules to delete
and to keep, and the data edits. This plan resolves the questions it leaves open, sequences the work,
and states how the collapse is proven rather than merely un-tested.

## Design decisions settled by this plan

### 1. The notice sentence stays off the catalogue card

The brief leaves open whether the `unassessedNotice` description should render on a card as well as
on a detail page. It should not. `GuideEntrySummary` today uses the coverage citations but not the
description, and a card is a scannable row, not a place for a paragraph. Keeping the split means
this feature is a rename at the card level and nothing more, which is what the acceptance criteria
ask for. Any change to card density is a separate, justified design decision.

### 2. The migration invariant normalises the retired status rather than exempting every food

Every food that has no rule in a list currently resolves to that list's `*-outside-coverage` status,
so the raw baseline in `src/test/preMigrationResolution.ts` names it roughly a hundred times. Adding
a hundred entries to `intentionallyChangedFoodIds` would gut the invariant precisely when it is most
needed, since the whole point of this feature is that no authored guidance changes.

Instead the invariant maps each retired status ID onto its list's `unassessedStatusId` when reading
the baseline, and a single dedicated test asserts that the mapping is the *only* difference: that no
food resolves to a status whose outcome band is `outside-coverage`, and that the retired IDs no
longer exist in any list. The baseline file itself is left untouched, so it keeps recording what the
pre-migration application actually produced.

The `panna-cotta` assertion in that suite currently pins `pregnancy-outside-coverage` as its *before*
status. That is a baseline read, so it becomes `pregnancy-not-assessed` under the same normalisation
and continues to prove the F-13 change it was written for.

### 3. Removing coverage does not change any resolved status except the retired one

Coverage only ever selected between two grey statuses. Collapsing them cannot change a food that has
an authored rule or an assessed ancestor. The invariant suite is what proves this, and it is the
reason this feature can be a single commit rather than a staged migration.

## Affected areas

| Path | Change |
| --- | --- |
| `src/domain/schemas.ts` | Narrow `outcomeBand` to four values; replace `coverageDeclarationSchema` with `unassessedNoticeSchema`; replace `coverage` with `unassessedNotice`; drop `outOfCoverageStatusId`. |
| `src/domain/assessment.ts` | Drop the `isCovered` parameter; resolve the empty case to `unassessedStatusId`; rename the `coverage-fallback` origin to `not-assessed`. |
| `src/domain/contentValidation.ts` | Delete `isFoodCovered`, `isCategoryCovered`, the containment check, the distinct-fallback checks, and the coverage-reference checks. Retarget the citation-policy rule at `unassessedNotice`. Keep every other rule. |
| `src/app/catalogueQuery.ts` | Drop `outside-coverage` from `outcomeBandOrder`. |
| `src/features/catalogue/CataloguePage.tsx` | Drop the `outside-coverage` filter label. |
| `src/components/GuidanceSection.tsx` | Read `unassessedNotice.citations` and `unassessedNotice.description`. |
| `src/components/GuideEntrySummary.tsx` | Read `unassessedNotice.citations`. |
| `src/data/guidanceLists.ts` | Remove both `Outside current coverage` statuses and both `coverage` blocks; add `unassessedNotice` to each; reword the pregnancy sentence. |

`src/domain/filtering.ts` needs no change: it compares outcome bands generically and narrows with the
enum.

## Content changes

- **Pregnancy list.** Delete `pregnancy-outside-coverage` and `outOfCoverageStatusId`. Move the
  coverage citation to `unassessedNotice.citations` unchanged. Reword the description from a
  statement about a declared boundary to a statement about this food: it has no reviewed rule in the
  MPI pullout guide that this guide is drawn from.
- **Vegetarian list.** Delete `vegetarian-outside-coverage` and `outOfCoverageStatusId`. Move the
  coverage description and citation to `unassessedNotice` unchanged; the existing sentence already
  reads as a statement about what the article names, so only the boundary framing is trimmed.
- **The 24 `categoryIds`/`foodIds` entries across both lists are deleted outright.** They are
  containment declarations with no remaining consumer.
- No assessment, food, or category record is touched.

## Constraints

- No assessment's status, summary, conditions, scenarios, citations, or reason links change.
- The URL contract stays at `v=1`. `outcome=outside-coverage` becomes unknown and is dropped by the
  existing invalid-constraint handling, which already announces the removal.
- The medical-information disclaimer is untouched and still states that a neutral state is not safe.
- 100% statements, branches, functions, and lines for application source is retained. Deleting the
  two coverage helpers removes branches; nothing new may be added that is unreachable.
- `not-assessed` remains a neutral, non-primary band, not a RAG filter.

## Tests

Rewritten as single-fallback assertions, not deleted:

- `src/domain/assessment.test.ts` — the outside-coverage resolutions become `not-assessed`
  resolutions with the `not-assessed` origin. Add a test that a food resolves identically under two
  different parent categories, proving re-parenting stability.
- `src/domain/contentValidation.test.ts` — delete the containment, distinct-fallback, and
  coverage-reference cases. Retarget the `required`-policy citation case at `unassessedNotice`.
  Assert every retained rule still fails: fallback status on an assessment, category assessment
  without a `scopeStatement`, food assessment with one, duplicate subject/list pair, unknown
  reference, `optional` policy without an `evidentiaryBasis`.
- `src/domain/migrationInvariant.test.ts` — add the baseline normalisation from decision 2, plus the
  dedicated collapse test.
- `src/domain/rawEggFoods.test.ts` and `src/domain/liftedCategoryGuidance.test.ts` — update any
  outside-coverage expectation.
- `src/app/catalogueQuery.test.ts` — `outcome=outside-coverage` is dropped and flagged as an
  unavailable filter removal.
- `src/features/food-detail/FoodDetailPage.test.tsx` — an unassessed food shows `Not assessed`, the
  notice sentence, and the notice citation.
- `src/features/catalogue/CataloguePage.test.tsx` — the outcome filter offers four bands and no
  `Outside current coverage` control.
- `e2e/` — the Playwright scenario for a food with no rule, and one for a shared URL carrying
  `outcome=outside-coverage`, plus the existing axe scans.
- A repository-wide check that the string `Outside current coverage` and the token
  `outside-coverage` appear nowhere in `src/` or `e2e/`.

## Ordered tasks

1. Accept the governing ADR and reconcile the accumulation ADR's "Interaction with the single
   not-assessed state ADR" section, which is written on the assumption that both are still
   `Proposed`.
2. Narrow the schema: `outcomeBand`, `unassessedNoticeSchema`, `unassessedNotice`, drop
   `outOfCoverageStatusId`.
3. Rewrite `src/data/guidanceLists.ts` for the new shape, including the reworded pregnancy sentence.
4. Simplify the resolver and delete the coverage helpers and the validation rules the ADR names.
5. Update the two components, `catalogueQuery`, and `CataloguePage`.
6. Update every affected test, including the invariant normalisation and the collapse test.
7. Run the full gates; confirm coverage is still 100%.
8. A subagent runs the `prepare` skill.
9. Human content review of the reworded pregnancy sentence — non-delegable, and blocking before this
   feature moves to `Done`.

## Validation

`npm run typecheck`, `npm run lint`, `npm test` with coverage, `npm run test:e2e` including the axe
scans, and `npm run build`.

## Risks

- **The reworded pregnancy sentence is displayed guidance-adjacent content.** It is not a rule, but
  it is the sentence a reader meets when the guide has nothing to say, so it goes through the human
  review gate rather than being written and shipped by an agent.
- **Losing the containment tripwire is accepted, not mitigated.** The ADR is explicit that mandatory
  human review carries this now. No replacement check is added here.
- **Coverage-percentage regressions.** Deleting branch-heavy helpers usually helps, but the
  `isCovered` callback removal changes `resolveWithAncestors`'s shape; verify rather than assume.
