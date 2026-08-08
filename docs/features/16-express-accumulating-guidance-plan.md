# F-16 Implementation Plan: Express Guidance That Accumulates Across Subject Levels

**Feature:** [F-16](<16-express-accumulating-guidance.md>)
**Status:** Implemented and verified

**Governing decisions:** [accumulate inherited guidance through additive assessments](<../decisions/2026-08-07 ADR - accumulate inherited guidance through additive assessments.md>), [assess categories as first-class subjects with inherited guidance](<../decisions/2026-08-06 ADR - assess categories as first-class subjects with inherited guidance.md>), [use independent guidance lists for food assessments](<../decisions/2026-08-04 ADR - use independent guidance lists for food assessments.md>), and [store reviewed guide content as version-controlled static data](<../decisions/2026-08-04 ADR - store reviewed guide content as version-controlled static data.md>)

The accepted ADR settles the design. This plan sequences it, resolves the two questions the ADR leaves
to implementation, and records the decisions this feature makes on its own.

## Design decisions settled by this plan

### 1. An addition may add to an addition

The brief leaves open whether an `'adds-to'` assessment may add to another `'adds-to'` assessment. It
may. The ADR already specifies the walk as "continue while `'adds-to'`, stop at and including the first
`'replaces'`", which produces chains of three or more naturally, and forbidding the third layer would
need an extra rule that no source shape motivates. No authored content in this feature uses a chain
longer than two, and the resolver is tested at three so the behaviour is pinned rather than incidental.

### 2. Restrictiveness is validated on the generic outcome band only

The ADR orders `okay` < `maybe` < `not-okay` for the coherence rule. The neutral `not-assessed` band
cannot appear on an authored assessment — an existing rule already rejects a fallback status on an
assessment — so it needs no position in the ordering, and the comparison never has to rank a neutral
band against a real one.

### 3. The catalogue marker is text, not an icon or a colour

`GuideEntrySummary` gains a plain sentence stating that further group guidance also applies, with the
existing link to the origin category. It is not a badge, a tooltip, or a colour, because the guide
never uses colour as the only signal and the browse view must not rely on hover.

## Affected areas

| Area | Change |
| --- | --- |
| `src/domain/schemas.ts` | `relation: z.enum(['replaces', 'adds-to']).optional()` on `assessmentSchema`. |
| `src/domain/assessment.ts` | `GuidanceLayer`, `layers` on `ResolvedAssessment`, and the accumulating ancestor walk. |
| `src/domain/contentValidation.ts` | Reject an `'adds-to'` assessment with no same-list ancestor assessment, and one less restrictive than what it adds to. |
| `src/components/GuidanceSection.tsx` | Render `layers`; single-layer markup unchanged. |
| `src/components/GuideEntrySummary.tsx` | Further-group-guidance marker when `layers.length > 1`. |
| `src/data/categories.ts` | No change; `freshly-cooked-seafood` already exists as a category. |
| `src/data/foods.ts` | Retire the `freshly-cooked-seafood` mirror food. |
| `src/data/assessments.ts` | Lift the group rule onto the category with a `scopeStatement`; set `relation: 'adds-to'` on the two footnoted shellfish; add optional `relation` to both spec helpers. |
| Tests | `assessment.test.ts`, `contentValidation.test.ts`, `liftedCategoryGuidance.test.ts`, `migrationInvariant.test.ts`, `FoodDetailPage.test.tsx`, `CataloguePage.test.tsx`, `e2e/catalogue.spec.ts`, `e2e/accessibility.spec.ts`. |

No change to the URL contract, filtering, search, the result count, or `src/app/`.

## Content changes

`freshly-cooked-seafood` exists today both as a category holding three foods and as a mirror food
carrying the group rule. F-12 deliberately left it alone. This feature completes it:

| Record | Change |
| --- | --- |
| Food `freshly-cooked-seafood` | Retired. Its aliases move onto the category. |
| Category `freshly-cooked-seafood` | Gains the group rule with `scopeStatement` "Applies to all freshly cooked fish, mussels, oysters, crayfish and scallops.", keeping the existing summary, scenario, condition, and locator verbatim. |
| `bluff-and-pacific-oysters`, `queen-scallops` | Keep their own red-free amber assessments and locator unchanged; gain `relation: 'adds-to'`. |
| `mussels`, `oysters`, `scallops` | Unchanged. They restate the cooking instruction with their own mercury note, so they remain replacements. |

No wording is rewritten and no source is re-fetched.

## Constraints

- The nearest authored status governs. Status, outcome band, chips, filtering, and the result count
  must not change for any food.
- Every existing assessment stays untouched, so an absent `relation` must behave exactly as
  `'replaces'` at every read site.
- Conditions are never moved between scenarios, and no scenario is rendered with conditions its author
  did not place in it.
- `src/domain/` must not import React, router, or browser modules, and the walk stays iterative.
- Repository-wide 100% statements, branches, functions, and lines coverage for application source is
  retained.

## Tests

Resolution, `src/domain/assessment.test.ts`:

1. A single-layer resolution returns exactly one layer and is otherwise identical to today.
2. An `'adds-to'` food assessment beneath an assessed category returns two layers, broadest first.
3. A three-level chain of two `'adds-to'` assessments returns three layers.
4. The walk stops at and includes the first `'replaces'` ancestor.
5. Accumulation never collects an assessment from another guidance list.
6. A coverage-fallback resolution returns an empty `layers` array.
7. The status is always the nearest assessment's, whatever the relation.

Validation, `src/domain/contentValidation.test.ts`:

8. An `'adds-to'` assessment with no same-list ancestor assessment fails.
9. An `'adds-to'` assessment less restrictive than what it adds to fails.

Content, `src/domain/accumulatingGuidance.test.ts`:

10. `Bluff and Pacific oysters` and `Queen scallops` resolve to two layers carrying both locators, and
    the cooking instruction is present.
11. `Parmesan` in the vegetarian scope still resolves to one layer.
12. The retired mirror food is gone and its guidance sits on the category.

React Testing Library:

13. `FoodDetailPage.test.tsx`: an accumulated food renders both statements with their own scope
    statement and citation, under the "all of the following apply" heading, with de-duplicated sources.
14. `FoodDetailPage.test.tsx`: a layer with more than one scenario introduces them with
    "Follow whichever applies".
15. `CataloguePage.test.tsx`: an accumulated food's card shows the further-group-guidance marker, and a
    single-layer card does not.

Chromium Playwright:

16. `e2e/catalogue.spec.ts`: `/food/bluff-and-pacific-oysters` shows both instructions and both locators.
17. `e2e/accessibility.spec.ts`: that route is scanned for WCAG 2.2 AA violations.

## Ordered tasks

1. Add `relation` to the schema and the two spec helpers, with no behaviour change. Add test 1.
2. Extend the resolver with `layers` and the accumulating walk. Add tests 2-7.
3. Add the two validation rules. Add tests 8-9.
4. Migrate the seafood content: lift the group rule onto the category, retire the mirror food, and set
   `relation: 'adds-to'` on the two footnoted shellfish. Add tests 10-12 and update the migration
   invariant to record the retirement and the intended change.
5. Render layers in `GuidanceSection` and the marker in `GuideEntrySummary`. Add tests 13-15.
6. Add the Playwright scenarios 16-17.
7. Content review gate, before the pull request: a human reviewer confirms against the source that the
   MPI seafood footnote is genuinely additive rather than a carve-out. Record the outcome in the brief.
   This gate is not delegable to an agent.
8. Run targeted validation, then the full gates.
9. Pre-PR verification: instruct a subagent to run the `prepare` skill against the branch diff, and
   record its findings, or their resolution, in the feature brief before F-16 moves to `Done`.

## Validation

- `npm test -- src/domain/assessment.test.ts src/domain/contentValidation.test.ts src/domain/accumulatingGuidance.test.ts src/features/food-detail/FoodDetailPage.test.tsx src/features/catalogue/CataloguePage.test.tsx`
- `npm run typecheck`
- `npm run lint`
- `npm run test:coverage` — 100% thresholds retained
- `npm run test:e2e` — includes the WCAG 2.2 AA axe scans
- `npm run build`

## Risks

- **A silent behaviour change to existing content.** Mitigation: `relation` is optional and defaults to
  `'replaces'`; no existing record is edited except the seafood ones this feature migrates, and the
  migration-invariant test pins every other food's resolution.
- **Layered rendering degrading the accessible heading order.** The ADR accepts scenario applicability
  headings moving to `h6` under a layer. Mitigation: axe scans on the layered route, and single-layer
  markup left byte-identical so no existing page shifts.
- **An accumulation no reviewer assessed as a whole.** Mitigation: task 7 is a blocking human review of
  the one additive pair this feature authors, and validation rejects an incoherent addition.
