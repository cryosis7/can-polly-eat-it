# F-12 Implementation Plan: Lift Group-Level Guidance onto Categories

**Feature:** [F-12](<12-lift-group-guidance-onto-categories.md>)
**Status:** Implemented

**Governing decisions:** [assess categories as first-class subjects with inherited guidance](<../decisions/2026-08-06 ADR - assess categories as first-class subjects with inherited guidance.md>), [model food groups as an unbounded category tree](<../decisions/2026-08-04 ADR - model food groups as an unbounded category tree.md>), [store reviewed guide content as version-controlled static data](<../decisions/2026-08-04 ADR - store reviewed guide content as version-controlled static data.md>), and [enforce complete coverage for application source](<../decisions/2026-08-05 ADR - enforce complete coverage for application source.md>)

## What this feature actually is

This is a **content migration**, not an application change. The application already renders assessed
categories (F-11), already resolves inherited guidance and discloses its origin (F-09), and already
validates `scopeStatement` ownership, subject uniqueness, and coverage containment. No new domain
capability is required.

The risk profile follows from that. The failure mode is not a broken build; it is a food silently
changing what it tells a pregnant reader. Every task below is therefore ordered so that a change in
displayed guidance is *detected mechanically* rather than reviewed by eye.

## Measured baseline

Taken from the authored data at `e3d5c5c`, before any migration:

| Measure | Value |
| --- | --- |
| Categories | 69 |
| Foods | 138 |
| Assessments | 134 |
| Category assessments | 5 |
| Announced result count (unfiltered) | 143 |

Verification of the brief's problem evidence against the data:

- **Mirror categories** — single direct food, no subcategories, no category assessment: **38**,
  confirming the brief. Of these, **31** share the food's identifier and **9** give the food a
  different *name*. The brief says "30 … share the category's identifier"; the true figure is 31, and
  the nine differing-name cases are the nine the brief resolves. Identifier-sameness and name-sameness
  are different sets, which is where the discrepancy arose.
- **Identical-rule categories** — the brief's automatic-lifting test finds exactly one:
  `pasteurised-cottage-and-cream-cheese`. `cottage-cheese` and `cream-cheese` are identical in status,
  summary, scenario applicability and instruction, both condition kinds and instructions, and citation
  locator. They differ **only** in synthetic record ids (`cottage-cheese-guidance` vs
  `cream-cheese-guidance`). Any equality check written for this migration must exclude synthetic ids
  or it will report no duplicates at all.
- **Cereals** — confirmed as the brief describes: `breakfast-cereals`, `rice`, and `pasta` share
  locator `Breads and cereals: Cereals — Breakfast cereals, rice, pasta, and similar`, while
  `fresh-filled-pasta` carries a distinct rule at locator `Breads and cereals: Cereals`.

## Findings that change the work

### 1. A second open-ended group rule — deferred to F-16, not handled here

`freshly-cooked-seafood` at first looked like the cereals case and is **deliberately excluded** from
this migration.

- The category holds three foods: `freshly-cooked-seafood`, `bluff-and-pacific-oysters`, and
  `queen-scallops`.
- The food `freshly-cooked-seafood` mirrors its category's identifier and carries locator
  `Seafood: Freshly cooked fish, mussels, oysters, crayfish, scallops, etc` — the trailing **"etc"** is
  the source making an open-ended group claim, the same signal that justifies the cereals lift.
- But the other two carry an **additive** rule, not an exception: "Limit these shellfish to one serving
  each month" (`frequency`) from the source's own footnote, versus "Cook above 75°C throughout"
  (`preparation`) on the group. A serving limit does not exempt an oyster from being cooked.

Because a food-level assessment is a total override and inherited guidance is applied whole, lifting
the cooking rule onto the category would assert that the footnote is an *exception* to it — a claim the
source does not make. Expressing additive guidance needs an ADR amendment, and is
[F-16](<16-express-accumulating-guidance.md>).

**Consequence for this plan:** the freshly-cooked-seafood group is untouched. Its mirror food falls
outside the 38 mirror categories anyway, because its category holds more than one food, so no scope is
lost. The migration-invariant test must show all three of its foods resolving **unchanged**.

### 2. Three test fixtures are themselves records being retired

The existing suites anchor on foods that this migration retires:

| Fixture | Used by | Impact |
| --- | --- | --- |
| `/food/pasteurised-yoghurt` | `e2e/catalogue.spec.ts` multi-scope detail scenario, `e2e/accessibility.spec.ts` settle locator | Mirror. URL becomes `/category/pasteurised-yoghurt`. Also the only mirror carrying a **vegetarian** assessment as well as a pregnancy one. |
| `/food/cooked-eggs` | `e2e/catalogue.spec.ts` detail scenario, `e2e/accessibility.spec.ts` axe route | Mirror. URL becomes `/category/cooked-eggs`. |
| `leftover-cooked-foods` | `src/features/food-detail/FoodDetailPage.test.tsx` scenario fixture | Mirror, and renamed to `Cooked foods`. |

This is not incidental churn. `pasteurised-yoghurt` is the repository's only cross-list mirror, so it
is the one record that proves per-list independence survives the migration; it must be migrated
early and deliberately rather than swept up at the end.

## Affected areas

| Area | Change |
| --- | --- |
| `src/data/categories.ts` | Renames on merged categories; new `sprouts-and-enoki-mushrooms` children; new `Commercial sauces, dressings and spreads` child; alias moves. |
| `src/data/foods.ts` | Retire mirror food records; split the sprouts mirror into two child foods; move aliases. |
| `src/data/assessments.ts` | Re-subject lifted assessments from food to category; author `scopeStatement` on each; remove duplicated food assessments. |
| `src/domain/contentValidation.test.ts` | Cases asserting each validation rule still rejects the shapes this migration could produce. |
| `src/domain/assessment.test.ts` | Inheritance-with-disclosed-origin cases for newly assessed categories. |
| `src/features/food-detail/FoodDetailPage.test.tsx` | Re-point the `leftover-cooked-foods` fixture. |
| `src/features/catalogue/CataloguePage.test.tsx` | Inherited-rule rendering for a food beneath a newly assessed category. |
| `e2e/catalogue.spec.ts` | Re-point retired detail URLs; add a migrated-alias search scenario. |
| `e2e/accessibility.spec.ts` | Re-point the `cooked-eggs` axe route and the settle locator. |

**No change to** `src/domain/schemas.ts`, `contentValidation.ts`, `assessment.ts`, `categoryTree.ts`,
`search.ts`, `filtering.ts`, the URL contract, or any component. If a domain source file needs
editing, the migration has strayed beyond content and must stop for review.

## Constraints

- No reviewed wording, status, condition, scenario, or citation locator is edited. `scopeStatement` is
  the only newly authored guidance text, and it restates the scope the source already claims.
- A category assessment must have a `scopeStatement`; a food assessment must not.
- A rule is lifted only onto the category the source scopes it to, never to a broader ancestor.
- The two guidance lists are migrated independently. No guidance crosses lists.
- Repository-wide 100% statements, branches, functions, and lines coverage for application source is
  retained.
- Coverage-containment assertions here (test 10) assume guidance-list coverage still exists. The
  `Proposed` [single not-assessed state ADR](<../decisions/2026-08-07 ADR - resolve unassessed guidance from a single not-assessed state.md>)
  would remove it. If that decision is accepted before this migration runs, drop test 10 rather than
  rewriting it; no other task here depends on coverage.

## Approach

### The guard comes first

Before any content changes, add a **migration-invariant test** that snapshots, for every food in the
catalogue and every guidance list, the fully resolved outcome: status id, summary, scenario
applicability and instruction text, ordered condition kinds and instructions, and citation title, URL,
and locator — keyed by food id and list id, and **excluding synthetic record ids**.

This test must pass unchanged after every subsequent task except where the brief explicitly permits a
change. It converts the acceptance criterion "no food's displayed status, summary, condition, or
source text differs from what it displayed before the migration" from a review promise into a failing
assertion. It is the reason the tasks below can be executed in small, independently verifiable steps.

Retired foods are the deliberate exception: a retired food leaves the keyspace, so the test records
the count and identity of departures and asserts they match the expected retirement set exactly. That
is what makes "no entry silently lost" mechanical.

### Lifting a rule

For each lift, the assessment record is *moved*, not rewritten:

1. Change `subject` from `{ kind: 'food', foodId }` to `{ kind: 'category', categoryId }`.
2. Add an authored `scopeStatement`.
3. Leave `statusId`, `summary`, `guidanceScenarios`, `reasonLinks`, and `citations` untouched.
4. Delete the now-duplicate food assessments, where the lift is a merge of identical rules.
5. Move the retired food's aliases, and its name where it differs, onto the category.

Assessment `id` values are renamed to match their new subject for legibility. Ids are synthetic and
not displayed, so this is safe — and the invariant test proves it by ignoring them.

### Migration groups

The work splits into four groups, ordered by increasing risk, each independently verifiable:

1. **Identical-rule merge** — `pasteurised-cottage-and-cream-cheese`. One lift, two food assessments
   removed, two foods retained and inheriting. Smallest possible exercise of the whole mechanism.
2. **Same-name mirrors** — the 31 whose food shares the category identifier, minus any needing naming
   judgement. Mechanical: retire food, lift assessment, move aliases.
3. **Differing-name mirrors** — the nine the brief resolves individually, applying "category name wins,
   retired food name becomes an alias", including the sauces child-category case and the sprouts split.
4. **Cereals exception** — lift the shared rule onto `Cereals`, leave `fresh-filled-pasta` overriding.

The freshly-cooked-seafood group is **not** a fifth group; see finding 1. It is untouched here.

Group 2 contains `pasteurised-yoghurt`; it is migrated **first within that group** because it is the
only cross-list mirror.

## Tests

Domain and content-validation:

1. Migration invariant: every retained food resolves byte-identically per list, ids excluded.
2. Migration invariant: the set of departed food ids equals the expected retirement set exactly.
3. `cottage-cheese` and `cream-cheese` have no own assessment and inherit from their category with the
   origin category, scope statement, and citation disclosed.
4. `breakfast-cereals`, `rice`, and `pasta` inherit from `Cereals`; `fresh-filled-pasta` resolves to
   its own assessment, not the inherited one.
5. `bluff-and-pacific-oysters`, `queen-scallops`, and `freshly-cooked-seafood` resolve **unchanged**,
   proving the deferred group was not disturbed.
6. `pasteurised-yoghurt` resolves independently in each list after migration, with no crossing.
7. Validation rejects a category assessment without `scopeStatement`.
8. Validation rejects a food assessment carrying a `scopeStatement`.
9. Validation rejects a subject assessed twice within one list.
10. Validation rejects a lifted assessment whose subject falls outside its list's declared coverage.
11. Every alias of a retired food is reachable on its category, and no alias matches two entries
    carrying different statuses.

React Testing Library:

12. A food beneath a newly assessed category shows the inherited rule with its origin disclosed.
13. A merged category renders its own status, summary, and source in the browse view.

Chromium Playwright:

14. A retired record's new `/category/<slug>` URL loads directly and shows its guidance.
15. Searching a migrated alias reaches the merged entry.
16. Re-pointed axe scan route passes with zero violations.

## Ordered tasks

1. Add the migration-invariant test (tests 1-2) against unmigrated data and confirm it passes. **No
   content changes in this task.**
2. Migrate group 1, the cottage/cream cheese merge. Add tests 3, 7-10. Confirm the invariant holds.
3. Migrate `pasteurised-yoghurt` alone. Add test 6. Re-point the two e2e specs that use its food URL.
4. Migrate the remaining same-name mirrors in group 2. Re-point the `FoodDetailPage.test.tsx`
   `leftover-cooked-foods` fixture and the `cooked-eggs` e2e and axe routes.
5. Migrate the nine differing-name mirrors in group 3, including the sauces child category and the
   sprouts split. Add test 11.
6. Migrate the cereals exception. Add test 4.
7. Confirm test 5 still passes, proving the seafood group is untouched.
8. Add tests 12-13, then Playwright scenarios 14-16.
9. Record the before-and-after record counts and the entry-by-entry reconciliation in the feature
   brief, as F-09 did.
10. Run targeted validation, then the full gates.
11. Pre-PR verification: instruct a subagent to run the `prepare` skill against the branch diff, and
    record its findings, or their resolution, in the feature brief before F-12 moves to `Done`.

## Validation

Targeted first, then the full gates:

- `npm test -- src/domain/contentValidation.test.ts src/domain/assessment.test.ts`
- `npm test -- src/features/catalogue/CataloguePage.test.tsx src/features/food-detail/FoodDetailPage.test.tsx`
- `npm run typecheck`
- `npm run lint`
- `npm run test:coverage` — 100% thresholds retained
- `npm run test:e2e`
- `npm run build`

## Risks

- **Silent guidance change.** The central risk of the whole feature. Mitigated by task 1 landing the
  invariant test before any content moves, so every later task is checked mechanically rather than by
  reading diffs.
- **Synthetic-id false negatives.** A naive equality check finds *zero* duplicate rules in this
  dataset, because record ids differ where reviewed content does not. Any comparison written here
  excludes ids; this is stated explicitly because it already produced one wrong answer during planning.
- **Cross-list contamination.** `pasteurised-yoghurt` is the only mirror carrying assessments in both
  lists, so it is migrated alone in its own task with a dedicated test.
- **Scope creep into F-13, F-14, and F-16.** The sauces merge deliberately stops at creating the
  `Commercial…` child. Authoring `Home-made sauces` is F-13's, re-parenting the animal-derived foods is
  F-14's, and the freshly-cooked-seafood group is F-16's. None is started here.
- **Broadening a claim by renaming.** Nine merges choose between two authored names. The brief resolves
  each one; this plan does not revisit them, and any case not covered by the brief stops for review
  rather than being decided in flight.
