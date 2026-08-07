# F-13 Implementation Plan: Surface Raw-Egg Foods Where People Browse for Them

**Feature:** [F-13](<13-surface-raw-egg-foods.md>)
**Status:** Implemented and verified

**Governing decisions:** [assess categories as first-class subjects with inherited guidance](<../decisions/2026-08-06 ADR - assess categories as first-class subjects with inherited guidance.md>), [model food groups as an unbounded category tree](<../decisions/2026-08-04 ADR - model food groups as an unbounded category tree.md>), [store reviewed guide content as version-controlled static data](<../decisions/2026-08-04 ADR - store reviewed guide content as version-controlled static data.md>), and [vary source-citation requirements by guidance list](<../decisions/2026-08-06 ADR - vary source-citation requirements by guidance list.md>)

This is a content-authoring change. It adds no domain capability, no schema field, and no UI affordance:
every behaviour it relies on — category assessment, ancestor inheritance with disclosed origin, coverage
containment, alias search, collapsible browse — already ships from F-09, F-10, F-11, and F-12.

## Preconditions from F-12

F-13 authors on top of F-12's migrated content and must not start before it lands. The specific
post-F-12 facts this plan assumes, each to be re-checked against `src/data/` before task 1:

1. `sauces-dressings-and-spreads` is a plain, unassessed browse heading, and the manufacturer rule sits
   on a child category `commercial-sauces-dressings-and-spreads`. The mirror food of the same id is
   retired.
2. The raw-egg avoid rule sits on the `raw-eggs` **category** with an authored `scopeStatement`, and the
   `raw-eggs-and-raw-egg-foods` food is retired with its aliases moved onto that category.
3. The cooked-egg rule sits on the `cooked-eggs` category and is unchanged.

If F-12 lands any of these differently, this plan is corrected before authoring rather than worked
around. Nothing in F-13 re-opens an F-12 decision.

## Design decisions settled by this plan

### 1. Root categories are ordered alphabetically

The brief needed a deliberate `sortOrder` for the new `Desserts` and `Drinks` roots. Inserting them into
the current hand-picked sequence would require justifying a position for every root, and the existing
order encodes nothing a reader can perceive. Root `sortOrder` is therefore reassigned alphabetically by
name, which is self-explaining, and makes every future root's position a fact rather than a negotiation.

| sortOrder | Root |
| --- | --- |
| 1 | Breads and cereals |
| 2 | Dairy |
| 3 | Desserts |
| 4 | Drinks |
| 5 | Eggs |
| 6 | Foods that may contain animal-derived ingredients |
| 7 | Meat and poultry |
| 8 | Miscellaneous |
| 9 | Seafood |
| 10 | Vegetables, salads and fruits |

Scope and limits:

- This applies to **roots only**. Child ordering inside a root is authored and unchanged, because a
  child's order often carries meaning the alphabet would destroy, such as `Pasteurised` before
  `Unpasteurised`.
- It is a `sortOrder` reassignment in `src/data/categories.ts` only. Authored order is still the single
  source of display order, so no domain, sorting, or rendering code changes and the tree ADR's
  "preserve authored sort order" constraint continues to hold.
- Accepted consequence: `Miscellaneous` and `Foods that may contain animal-derived ingredients` move up
  the page and `Seafood` and `Vegetables, salads and fruits` move down. No guidance changes.
- It is carried here rather than split out because F-13 is the change that forces the question; shipping
  the new roots at an arbitrary position and re-ordering later would churn the browse view twice.

### 2. Panna cotta's move puts it inside pregnancy coverage

Moving `Panna cotta` into `Cold desserts` moves it from a root outside pregnancy coverage into one
inside it. Its pregnancy result therefore changes from `Outside current coverage` to the inherited amber
`Cold desserts` rule with its origin disclosed. That is the correct outcome under the existing
resolution order and is the same treatment every other unassessed cold dessert gets, but it is a visible
change to an existing entry, so it is asserted explicitly rather than discovered. Its vegetarian
assessment and vegetarian coverage are untouched.

### 3. Named red foods, not exceptions on the group

Every food the source names is authored as a food record with its own red assessment. None uses an
opt-out flag or a negated condition; the existing resolution order already makes a food's own assessment
win over its ancestor's. This is the `Hard cheese`/`Parmesan` shape the brief cites.

## Affected areas

| Area | Change |
| --- | --- |
| `src/data/categories.ts` | Alphabetical root `sortOrder`; add `desserts`, `cold-desserts`, `home-made-ice-cream`, `drinks`, `home-made-drinks`, `home-made-sauces`; re-parent `ice-cream` and `fruit-juice-kombucha-and-cider`; prune migrated aliases. |
| `src/data/foods.ts` | Add the named raw-egg foods and `smoothies`; move `panna-cotta`. |
| `src/data/assessments.ts` | Four amber category assessments; seven red food assessments. |
| `src/data/guidanceLists.ts` | Pregnancy `coverage.categoryIds` gains `desserts` and `drinks`. |
| `src/domain/contentValidation.test.ts` | Cases for the new subtree, coverage containment, and alias uniqueness. |
| `src/domain/assessment.test.ts` | Inheritance and food-level override cases for the new groups. |
| `src/domain/search.test.ts` | Migrated aliases reach exactly one entry. |
| `src/features/catalogue/CataloguePage.test.tsx` | Split sauces view; inherited cold dessert with disclosed origin. |
| `e2e/catalogue.spec.ts` | Direct `/category/cold-desserts` load; search for a migrated alias. |

No change to `src/domain/` production code, `src/app/`, the URL contract, or any component.

## Content changes

### Categories added

| id | name | parent | sortOrder | Assessed |
| --- | --- | --- | --- | --- |
| `home-made-sauces` | Home-made sauces | `sauces-dressings-and-spreads` | 2 | Amber |
| `desserts` | Desserts | root | 3 | No — browse heading |
| `cold-desserts` | Cold desserts | `desserts` | 1 | Amber |
| `home-made-ice-cream` | Home-made ice cream | `ice-cream` | 3 | Amber |
| `drinks` | Drinks | root | 4 | No — browse heading |
| `home-made-drinks` | Home-made drinks | `drinks` | 2 | Amber |

`Commercial sauces, dressings and spreads` keeps `sortOrder` 1 beneath the sauces heading, and
`Fruit juice, kombucha and cider (non-alcoholic)` takes `sortOrder` 1 beneath `Drinks`, so the
commercial and pasteurised-product entries lead each group and the home-made groups follow.

### Categories re-parented

| Category | From | To |
| --- | --- | --- |
| `ice-cream` | `dairy` | `cold-desserts` |
| `fruit-juice-kombucha-and-cider` | `miscellaneous` | `drinks` |

Both keep their children and every existing assessment, including the `Packaged` green and `Soft-serve`
red rules with their existing `Dairy: …` locators, which are not rewritten.

### Foods added

| id | name | parent category | Pregnancy |
| --- | --- | --- | --- |
| `mayonnaise` | Mayonnaise | `home-made-sauces` | Red |
| `hollandaise-sauce` | Hollandaise sauce | `home-made-sauces` | Red |
| `caesar-dressing` | Caesar dressing | `home-made-sauces` | Red |
| `mousse` | Mousse | `cold-desserts` | Red |
| `tiramisu` | Tiramisu | `cold-desserts` | Red |
| `eggnog` | Eggnog | `home-made-drinks` | Red |
| `egg-flips` | Egg flips | `home-made-drinks` | Red |
| `smoothies` | Smoothies | `home-made-drinks` | None — inherits amber |

`mayonnaise` carries the aliases `home-made mayonnaise` and `dressings containing mayonnaise`.
`panna-cotta` moves from `foods-that-may-contain-animal-derived-ingredients` to `cold-desserts` with its
record otherwise unchanged.

### Aliases removed from the raw-eggs category

`home-made mayonnaise`, `mousse`, `tiramisu`, `eggnog`, `egg flips`, `smoothies`, and
`home-made ice cream` are removed as each becomes an entry in its own right. The raw-eggs entry keeps
its status, summary, conditions, citation, and its raw-egg-specific aliases.

### Citations

Every record authored here cites the existing MPI pullout guide. Red records use the existing raw-eggs
locator; the amber group rules use the same locator, because the rule they apply conditionally is the
raw-eggs rule. Where an amber rule points at cooking the egg, it references the existing cited
`Cooked eggs` rule rather than authoring an exception. No source is re-fetched, and no new source is
introduced.

## Constraints

- Pregnancy is `citationPolicy: 'required'`, so an uncited record fails validation at module load.
- A category assessment must have a `scopeStatement`; a food assessment must not.
- Coverage containment is resolved by ancestor walk, so `desserts` and `drinks` must be added to
  `coverage.categoryIds` in the **same commit** as the moves, or the moved ice-cream assessments fail
  validation.
- No wording implies a home cook can obtain pasteurised egg.
- The amber summaries must read as the cited rule applied conditionally, never as new advice.
- Repository-wide 100% statements, branches, functions, and lines coverage for application source is
  retained.

## Tests

Content validation, `src/domain/contentValidation.test.ts`:

1. The full authored content parses, with `desserts` and `drinks` inside pregnancy coverage.
2. Removing `desserts` from `coverage.categoryIds` fails coverage containment for the ice-cream
   assessments — proving the coupling rather than assuming it.
3. An amber group assessment without a `scopeStatement` fails.
4. No alias or name is shared by two entries.

Resolution, `src/domain/assessment.test.ts`:

5. `Smoothies` resolves to the `Home-made drinks` amber rule with origin, scope statement, and citation
   disclosed.
6. `Eggnog` resolves to its own red assessment, and the amber group rule is not merged into it.
7. `Panna cotta` resolves to the `Cold desserts` amber rule for pregnancy and keeps its unchanged
   vegetarian assessment.
8. `Packaged ice cream` keeps its green rule beneath the amber `Cold desserts` ancestor.

Search, `src/domain/search.test.ts`:

9. `hollandaise`, `caesar dressing`, `tiramisu`, and `dressings containing mayonnaise` each reach
   exactly one entry, and none reaches the raw-eggs entry as well.

React Testing Library, `src/features/catalogue/CataloguePage.test.tsx`:

10. `Sauces, dressings and spreads` renders as a heading with a commercial and a home-made child, and
    neither child shows the other's rule.
11. A cold dessert with no assessment renders the inherited amber status with its origin category named.
12. `Dairy` no longer lists ice cream and `Miscellaneous` no longer lists fruit juice.
13. Roots render in alphabetical order.

Chromium Playwright, `e2e/catalogue.spec.ts`:

14. `/category/cold-desserts` loads directly and shows its amber rule and its children.
15. Searching a migrated alias reaches the new entry from a cold start.

## Ordered tasks

1. Verify the three F-12 preconditions against `src/data/`. Stop and correct this plan if any differs.
2. Reassign root `sortOrder` alphabetically. Add test 13 and fix any ordering assertion churn, with no
   other change in the commit so the re-order is reviewable on its own.
3. Add the `Desserts` and `Drinks` roots with their assessed children, and add both to pregnancy
   `coverage.categoryIds` in the same change. Add tests 1-3.
4. Re-parent `ice-cream` and `fruit-juice-kombucha-and-cider`, and move `panna-cotta`. Add tests 7, 8,
   and 12.
5. Add `Home-made sauces` and its three named red foods; prune the migrated raw-eggs aliases. Add tests
   4, 9, and 10.
6. Add the cold-dessert and home-made-drink foods. Add tests 5, 6, and 11.
7. Add Playwright scenarios 14-15.
8. Content review gate, before the pull request: a human reviewer confirms against the source that the
   amber group summaries read as the cited rule applied conditionally, and that `Home-made ice cream`
   is amber rather than red. Record the outcome in the brief. This gate is not delegable to an agent.
9. Run targeted validation, then the full gates.
10. Pre-PR verification: instruct a subagent to run the `prepare` skill against the branch diff, and
    record its findings, or their resolution, in the feature brief before F-13 moves to `Done`.

## Validation

Targeted first, then the full gates:

- `npm test -- src/domain/contentValidation.test.ts src/domain/assessment.test.ts src/domain/search.test.ts src/features/catalogue/CataloguePage.test.tsx`
- `npm run typecheck`
- `npm run lint`
- `npm run test:coverage` — 100% thresholds retained
- `npm run test:e2e` — includes the WCAG 2.2 AA axe scans
- `npm run build`

## Risks

- **Merge conflict with F-12.** F-13 edits the same four data files F-12 rewrites. Mitigation: do not
  branch until F-12 is merged, and treat task 1 as a hard gate.
- **Coverage-containment failure discovered late.** The ice-cream move and the coverage addition are
  separable edits that must not be separated. Task 3 lands the coverage first, and test 2 pins it.
- **Guidance drift in the amber wording.** This is the one place the feature composes rather than
  restates the source. Task 8 is a blocking human review, and the brief already flags it as needing the
  closest review.
- **Reader loses ice cream from Dairy.** Accepted deliberately in the brief; a category has one parent
  and the model offers no "see also". Test 12 asserts the loss is intended rather than accidental.
- **Root re-order churn.** Reassigning every root's `sortOrder` can break unrelated ordering assertions.
  Task 2 isolates it in its own commit.
