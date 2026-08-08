# F-14 Implementation Plan: Retire the Animal-Derived Ingredients Category

**Feature:** [F-14](<14-retire-animal-derived-foods-category.md>)
**Status:** Implemented, content-reviewed, and verified

## Implementation record

Delivered on `agents/f14-retire-animal-derived-category`. Three findings changed the plan as written;
each is a fact the plan could not know before the migration was attempted.

1. **Two foods gain inherited pregnancy guidance.** `breads` and
   `commercial-sauces-dressings-and-spreads` both carry their own cited pregnancy rule, so `tortillas`
   now resolves to the green `Breads` rule and `worcestershire-sauce` to the amber commercial-sauces
   rule, instead of `Not assessed`. No guidance was authored: both foods simply now sit under a group
   that already had a reviewed rule, which is exactly the resolution order working as designed. Each
   is asserted explicitly in `migrationInvariant.test.ts` rather than exempted, and the eleven other
   migrated foods are asserted to resolve byte-identically to their pre-migration baseline.
2. **Tasks 2-4 were committed together, not separately.** The plan wanted the root renumbering
   isolated, but a contiguous alphabetical root sequence cannot exist while the retired root is still
   present, and Zod validation runs at module load, so the intermediate states do not build. The
   category additions, re-parenting, renumbering, and deletion are therefore one commit.
3. **Two planned assertions did not match the application.** `FoodDetailPage` renders no category
   path, so the path assertion moved to the catalogue's category-filter breadcrumbs and the domain
   tree test; the detail-page test instead asserts the inherited group rule a migrated food now
   discloses. `/category/confectionery` is deliberately not routable, because unassessed categories
   are plain browse headings, so the Playwright scenario asserts that not-found behaviour rather than
   a category page.

An existing alias-uniqueness test was relaxed from "reaches exactly one entry" to "reaches at most one
assessed entry, and never entries with differing guidance". `commercial mayonnaise` now legitimately
reaches both the assessed commercial-sauces category and its one inheriting descendant food; the
relaxed assertion keeps the real intent, which is that an alias never surfaces conflicting advice.

Validation: 154 unit tests pass, 49 Chromium Playwright tests pass including the WCAG 2.2 AA axe
scans, `typecheck`, `lint`, and `build` are clean, and coverage holds at 100% statements, branches,
functions, and lines.

Content review: a maintainer reviewed the five invented headings on 2026-08-08 and accepted them as
neutral browse headings, confirming rather than overturning the `Ingredients and additives` placement.

Pre-PR `prepare`: run by a subagent against the branch diff. It raised no blockers and four
documentation-drift findings, all in this plan — a stale status line, a stale affected-areas row, and
two stale test-list items that still described the pre-implementation assertions for
`FoodDetailPage` and `/category/confectionery`. Each was corrected in place, and the final re-run
reported ready to raise with zero findings.

**Governing decisions:** [model food groups as an unbounded category tree](<../decisions/2026-08-04 ADR - model food groups as an unbounded category tree.md>), [use independent guidance lists for food assessments](<../decisions/2026-08-04 ADR - use independent guidance lists for food assessments.md>), [assess categories as first-class subjects with inherited guidance](<../decisions/2026-08-06 ADR - assess categories as first-class subjects with inherited guidance.md>), [store reviewed guide content as version-controlled static data](<../decisions/2026-08-04 ADR - store reviewed guide content as version-controlled static data.md>), and [resolve unassessed guidance from a single not-assessed state](<../decisions/2026-08-07 ADR - resolve unassessed guidance from a single not-assessed state.md>)

This is a pure content-migration change. It adds no schema field, no domain capability, and no UI
affordance. Every behaviour it relies on — the adjacency-list forest, nearest-subject-first
resolution, the single `Not assessed` fallback, alias and category-path search, collapsible browse —
already ships from F-09, F-11, F-12, F-13, and F-15. It authors no guidance, so it introduces no
citation and re-fetches no source.

## Preconditions verified against `src/data/`

Checked before this plan was written; re-check before task 1 and correct the plan rather than work
around any difference.

1. `foods-that-may-contain-animal-derived-ingredients` is a root category with `sortOrder` 6, empty
   aliases, and **no assessment of its own**. Nothing inherits from it.
2. It holds exactly **thirteen** foods in `src/data/foods.ts`: `apple-pie`, `french-fries`,
   `gelatin`, `gummy-bears`, `jelly`, `marshmallows`, `orange-juice`, `starburst`, `tortillas`,
   `vegetable-soup`, `white-sugar`, `wine-and-beer`, `worcestershire-sauce`. `panna-cotta` has
   already been moved to `cold-desserts` by F-13, so this plan does not move it.
3. The destination categories F-12 and F-13 were to provide all exist: `desserts` (root, `sortOrder`
   3), `drinks` (root, `sortOrder` 4), `breads` (under `breads-and-cereals`), `miscellaneous`
   (root), `fruit-juice-kombucha-and-cider` (under `drinks`), and
   `commercial-sauces-dressings-and-spreads` (under `sauces-dressings-and-spreads`).
4. Root `sortOrder` is already alphabetical by name, per F-13's decision.
5. The retired id appears in only three places outside the two data files: nowhere in
   `src/data/assessments.ts`, and once in `e2e/catalogue.spec.ts` line 14, which expands the heading
   by accessible name. `src/test/preMigrationResolution.ts` is a frozen pre-migration snapshot and is
   **not** edited by this feature; it is the baseline `src/domain/migrationInvariant.test.ts` compares
   against.

## Design decisions settled by this plan

### 1. Root ordering stays alphabetical, and is renumbered in one edit

F-13 established alphabetical root `sortOrder`. Retiring one root and adding three means every root
after `Breads and cereals` shifts. Renumber all roots in a single contiguous 1..12 sequence so no gap
or duplicate is left, per the brief:

| sortOrder | Root |
| --- | --- |
| 1 | Breads and cereals |
| 2 | Confectionery |
| 3 | Dairy |
| 4 | Desserts |
| 5 | Drinks |
| 6 | Eggs |
| 7 | Ingredients and additives |
| 8 | Meat and poultry |
| 9 | Miscellaneous |
| 10 | Seafood |
| 11 | Soups |
| 12 | Vegetables, salads and fruits |

Child ordering inside every root is untouched.

### 2. `Gelatin` and `White sugar` go to `Ingredients and additives`

The brief left this open, offering `Miscellaneous` as the alternative. The plan takes the brief's
proposal. It is a reversible content decision — moving two `primaryCategoryId` values and deleting one
category — and the heading reads as a food group rather than as a reason for assessment, which is the
whole point of the feature. Recorded as resolved-with-alternative in the brief; a reviewer may
overturn it at the task 8 content gate without changing any other part of this plan.

### 3. Foods keep their identifiers, so no URL for a food changes

Only `primaryCategoryId` changes. Slugs, names, aliases, tags, and every assessment are untouched, so
`/food/<slug>` is stable for all thirteen. The only URL lost is
`/category/foods-that-may-contain-animal-derived-ingredients`, which the brief accepts because the
application is unreleased and the category carries no assessment.

### 4. `sortOrder` within a destination is positional, not authored per food

`src/data/foods.ts` derives each food's `sortOrder` from its index inside its `foodGroups` entry.
Migrated foods are therefore appended to, or authored into, their destination group in a deliberate
reading order; there is no separate `sortOrder` field to maintain. Where a destination group already
exists (`breads` has none today, `fruit-juice-kombucha-and-cider` has none today,
`commercial-sauces-dressings-and-spreads` has none today, `miscellaneous` has none today), a new
`foodGroups` entry is added for it.

## Affected areas

| Area | Change |
| --- | --- |
| `src/data/categories.ts` | Delete the retired root; add `confectionery`, `ingredients-and-additives`, `soups`, `baked-desserts`, `alcoholic-drinks`; renumber root `sortOrder` 1..12. |
| `src/data/foods.ts` | Remove the retired `foodGroups` entry; distribute its thirteen foods into eight destination groups. |
| `src/data/assessments.ts` | No change. Asserted by test, not assumed. |
| `src/domain/contentValidation.test.ts` | Retired-category absence; unknown-parent and orphan rules still fire; new categories are unassessed. |
| `src/domain/assessment.test.ts` | Vegetarian resolution unchanged across the move; pregnancy `Not assessed` unchanged. |
| `src/domain/migrationInvariant.test.ts` | Confirm the existing pre-migration invariant still passes unchanged; extend only if it is scoped to prior features. |
| `src/domain/search.test.ts` | Each migrated food is still reached by name and existing aliases. |
| `src/features/catalogue/CataloguePage.test.tsx` | No retired heading; new roots render in alphabetical position; migrated foods render under their new parents. |
| `src/features/food-detail/FoodDetailPage.test.tsx` | A migrated food discloses the group rule it now inherits. The page renders no category path, so ancestry is asserted in the catalogue filter breadcrumbs and the domain tree test instead. |
| `e2e/catalogue.spec.ts` | Replace the line-14 expansion of the retired heading with a real food group; add a browse-to-migrated-food scenario and a vegetarian-scoped filtered URL. |

No change to `src/domain/` production code, `src/app/`, any component, the URL contract, or
`src/data/guidanceLists.ts`.

## Content changes

### Categories added

All five are plain browse headings with **no assessment**, therefore no `scopeStatement` and no
citation.

| id | name | parent | sortOrder |
| --- | --- | --- | --- |
| `confectionery` | Confectionery | root | 2 |
| `ingredients-and-additives` | Ingredients and additives | root | 7 |
| `soups` | Soups | root | 11 |
| `baked-desserts` | Baked desserts | `desserts` | 2 |
| `alcoholic-drinks` | Alcoholic drinks | `drinks` | 3 |

`baked-desserts` takes `sortOrder` 2 after the existing `cold-desserts`; `alcoholic-drinks` takes 3
after `fruit-juice-kombucha-and-cider` (1) and `home-made-drinks` (2). No alias is authored on any new
category, so no existing search result changes owner.

### Category removed

`foods-that-may-contain-animal-derived-ingredients`, after every food beneath it is re-parented.

### Foods re-parented

| Food | From | To |
| --- | --- | --- |
| `apple-pie` | retired root | `baked-desserts` |
| `gummy-bears`, `jelly`, `marshmallows`, `starburst` | retired root | `confectionery` |
| `gelatin`, `white-sugar` | retired root | `ingredients-and-additives` |
| `vegetable-soup` | retired root | `soups` |
| `french-fries` | retired root | `miscellaneous` |
| `tortillas` | retired root | `breads` |
| `orange-juice` | retired root | `fruit-juice-kombucha-and-cider` |
| `wine-and-beer` | retired root | `alcoholic-drinks` |
| `worcestershire-sauce` | retired root | `commercial-sauces-dressings-and-spreads` |

`orange-juice` is filed on `fruit-juice-kombucha-and-cider` itself, not on its pasteurised or
unpasteurised child, because the vegetarian rule about added fish-derived omega-3 is unrelated to
pasteurisation and the source does not say which kind of juice it means.

### Records explicitly not changed

No status, summary, scenario, condition, citation, reason link, name, alias, tag, or identifier on any
food or assessment. No guidance list, status, outcome band, or coverage. No new assessment for any
migrated food, including `Wine and beer`, because authoring one would be new guidance from an
unreviewed source, which F-04 forbids.

## Constraints

- The re-parent must precede the deletion in the same change, so validation never sees an orphaned
  category or a food pointing at a missing parent.
- New categories are unassessed, so they must not gain a `scopeStatement`; a category assessment
  requires one, and this feature authors none.
- Migrated foods with no reviewed pregnancy rule must continue to resolve to the pregnancy list's
  single `Not assessed` state, unchanged by their new ancestry. F-15 makes this a fact of the model
  rather than something to engineer here.
- A food's matchable text includes its category-path labels, so ancestry changes what search matches.
  No alias is added, removed, or edited to compensate.
- Repository-wide 100% statements, branches, functions, and lines coverage for application source is
  retained.

## Tests

Content validation, `src/domain/contentValidation.test.ts`:

1. The full authored content parses, and no category, food, or assessment references
   `foods-that-may-contain-animal-derived-ingredients`.
2. A food left pointing at the retired category fails the unknown-parent/unknown-category rule.
3. Each new category is present, unassessed, and has no `scopeStatement`.
4. Root `sortOrder` values are unique, contiguous, and alphabetical by name.

Resolution, `src/domain/assessment.test.ts`:

5. Each migrated food's vegetarian status, summary, conditions, and citation are identical before and
   after the move, asserted against the pre-migration snapshot.
6. `Orange juice` resolves its own vegetarian assessment and inherits nothing from either
   pasteurisation child.
7. A migrated food with no reviewed pregnancy rule — `Gummy bears` — resolves to the pregnancy list's
   `Not assessed` state and its `unassessedNotice`, not to a safe status.
8. `Worcestershire sauce` beneath `Commercial sauces, dressings and spreads` shows the inherited
   commercial rule with its origin disclosed, and its own vegetarian assessment unchanged.

Migration invariant, `src/domain/migrationInvariant.test.ts`:

9. The existing invariant still passes with no edit to `src/test/preMigrationResolution.ts`. If it is
   scoped to earlier features only, extend its subject set to the thirteen migrated foods rather than
   regenerating the snapshot.

Search, `src/domain/search.test.ts`:

10. Each migrated food is reached by its existing name, and `chips`, `gelatine`, `jello`,
    `vegetable soups`, `wine`, and `beer` each still reach exactly one entry.

React Testing Library:

11. `CataloguePage` renders no `Foods that may contain animal-derived ingredients` heading.
12. `CataloguePage` renders the twelve roots in alphabetical order, including the three new ones.
13. `CataloguePage` shows `Orange juice` once, under `Fruit juice, kombucha and cider
    (non-alcoholic)`, and no juice entry outside the drinks subtree.
14. `CataloguePage` offers each new food group as a category filter under its full authored path, and
    `FoodDetailPage` discloses the group rule a migrated food now inherits. Amended during
    implementation: `FoodDetailPage` renders no category path, so the path assertion lives in the
    catalogue's filter breadcrumbs and in the domain tree test instead.
15. Filtering by the vegetarian scope returns the same entry set and the same announced result count
    as before the migration.

Chromium Playwright, `e2e/catalogue.spec.ts`:

16. Line 14's expansion of the retired heading is retargeted at a real food group and the surrounding
    scenario still passes.
17. Browse from the catalogue into a migrated food through its new category, and confirm
    `/category/confectionery` is not routable. Amended during implementation: an unassessed category
    is a plain browse heading rather than a guide entry, so the direct load correctly reaches the
    category-not-found page rather than a category page.
18. A vegetarian-scoped filtered URL returns the unchanged entry set. The axe 2.2 AA scans cover the
    new headings.

## Ordered tasks

1. Re-verify the five preconditions against `src/data/`. Stop and correct this plan if any differs.
2. Add the five new categories and renumber root `sortOrder` 1..12, keeping the retired root in place
   for now. Add tests 3 and 4. Commit alone so the ordering change is reviewable on its own.
3. Re-parent all thirteen foods into their destinations. Add tests 10, 13, and 14.
4. Delete the retired category. Add tests 1, 2, 11, and 12.
5. Assert nothing else moved: run tests 5-9 and 15, and confirm `src/data/assessments.ts` and
   `src/test/preMigrationResolution.ts` are untouched in the diff.
6. Update and extend the Playwright scenarios, 16-18.
7. Update the brief: record the `Ingredients and additives` decision as resolved, and move F-14 to
   `In progress` when task 2 begins and `Done` only after task 10.
8. Content review gate before the pull request: a human reviewer confirms the five invented headings
   read as neutral browse headings and are never presented as something a source claims, and confirms
   or overturns the `Ingredients and additives` placement. Record the outcome in the brief. This gate
   is not delegable to an agent.
9. Run targeted validation, then the full gates.
10. Pre-PR verification: instruct a subagent to run the `prepare` skill against the branch diff, and
    record its findings, or their resolution, in the feature brief before F-14 moves to `Done`.

## Validation

Targeted first, then the full gates:

- `npm test -- src/domain/contentValidation.test.ts src/domain/assessment.test.ts src/domain/search.test.ts src/domain/migrationInvariant.test.ts src/features/catalogue/CataloguePage.test.tsx src/features/food-detail/FoodDetailPage.test.tsx`
- `npm run typecheck`
- `npm run lint`
- `npm run test:coverage` — 100% thresholds retained
- `npm run test:e2e` — includes the WCAG 2.2 AA axe scans
- `npm run build`

## Risks

- **Orphan or dangling parent mid-change.** Deleting the category before re-parenting fails validation
  at module load. Mitigation: tasks 3 and 4 are ordered, and test 2 asserts the failure mode is caught
  rather than silently tolerated.
- **Silent guidance drift.** The feature's entire value depends on nothing but ancestry changing.
  Mitigation: task 5 is an explicit diff check, and the pre-migration snapshot is the machine-checked
  baseline.
- **Search results change through category-path labels.** A migrated food gains new ancestor labels
  and loses the old ones, so a query matching the retired heading no longer reaches those foods. This
  is intended; test 10 pins the names and aliases that must keep working.
- **Root re-order churn.** Renumbering every root can break unrelated ordering assertions. Task 2
  isolates it.
- **Invented headings read as sourced advice.** Five headings are editorial. Task 8 is a blocking
  human review, and no heading carries an assessment, a scope statement, or a citation.
