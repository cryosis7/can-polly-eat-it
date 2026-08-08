# F-14: Retire the Animal-Derived Ingredients Category

**Status:** Done

**Implementation plan:** [F-14 implementation plan](<14-retire-animal-derived-foods-category-plan.md>)

**Depends on:** [F-04: Maintain Trustworthy Guidance Content](<04-maintain-trustworthy-guidance-content.md>), [F-12: Lift Group-Level Guidance onto Categories](<12-lift-group-guidance-onto-categories.md>), [F-13: Surface Raw-Egg Foods Where People Browse for Them](<13-surface-raw-egg-foods.md>), [F-15: Retire the Outside-Coverage State](<15-retire-outside-coverage-state.md>)

**Governing decisions:** [model food groups as an unbounded category tree](<../decisions/2026-08-04 ADR - model food groups as an unbounded category tree.md>), [use independent guidance lists for food assessments](<../decisions/2026-08-04 ADR - use independent guidance lists for food assessments.md>), [assess categories as first-class subjects with inherited guidance](<../decisions/2026-08-06 ADR - assess categories as first-class subjects with inherited guidance.md>), [store reviewed guide content as version-controlled static data](<../decisions/2026-08-04 ADR - store reviewed guide content as version-controlled static data.md>), and [resolve unassessed guidance from a single not-assessed state](<../decisions/2026-08-07 ADR - resolve unassessed guidance from a single not-assessed state.md>)

## Goal

As Polly, I need every food to be filed under what it *is* rather than under why someone assessed it,
so that I find apple pie with the desserts, orange juice with the juices, and wine and beer with the
drinks, instead of meeting a category that only makes sense if I already know which article the entry
came from.

## Problem evidence

`foods-that-may-contain-animal-derived-ingredients` is a root category holding the fourteen foods the
reviewed Veggy Malta article named. It is not a food group: it is the article's table of contents,
promoted to a browse heading. Three consequences follow.

- Browsing it tells a reader nothing about what the foods have in common as *foods*. Gelatin, orange
  juice, tortillas, and wine sit as siblings.
- It collides with the real tree. `Orange juice` sits there while
  `Fruit juice, kombucha and cider (non-alcoholic)` sits under `Miscellaneous` with its own
  pasteurised and unpasteurised entries, so the guide has two unrelated homes for juice.
- Any food added later for the same *reason* is drawn into it, deepening the problem. F-13 already
  moves `Panna cotta` out on exactly these grounds, and records the rest as
  "open, and likely its own feature". This is that feature.

The category has no assessment of its own, and every food beneath it carries its own vegetarian
assessment, so nothing inherits from it. Retiring it therefore removes a browse heading without
removing any guidance.

## Primary experience

1. Browse the guide and find no `Foods that may contain animal-derived ingredients` heading.
2. Browse `Drinks` and find `Orange juice` beneath `Fruit juice, kombucha and cider (non-alcoholic)`,
   in one place, not two.
3. Browse `Drinks` and find `Wine and beer` under an `Alcoholic drinks` heading.
4. Browse `Desserts` and find `Apple pie` and `Panna cotta` with the other desserts.
5. Filter by the vegetarian scope and see exactly the same set of entries, with the same statuses,
   summaries, and sources as before — reached through the food groups they belong to.

## Required behaviour

- The `foods-that-may-contain-animal-derived-ingredients` category is removed from the authored data.
  Every one of its foods is re-parented first, so the category is never left orphaned and no food is
  ever left pointing at a category that does not exist.
- Each food keeps its existing identifier, name, aliases, and every per-list assessment exactly as
  authored. This feature moves records; it does not restate, reword, re-derive, or re-source guidance,
  and no source is re-fetched.
- The destinations are:

  | Food | Destination |
  | --- | --- |
  | `apple-pie` | new `Baked desserts` beneath the `Desserts` root F-13 creates |
  | `panna-cotta` | `Cold desserts` — already carried out by F-13, not repeated here |
  | `gummy-bears`, `jelly`, `marshmallows`, `starburst` | new `Confectionery` root |
  | `gelatin`, `white-sugar` | new `Ingredients and additives` root |
  | `vegetable-soup` | new `Soups` root |
  | `french-fries` | `Miscellaneous` directly |
  | `tortillas` | `Breads` |
  | `orange-juice` | `Fruit juice, kombucha and cider (non-alcoholic)` |
  | `wine-and-beer` | new `Alcoholic drinks` beneath the `Drinks` root F-13 creates |
  | `worcestershire-sauce` | `Commercial sauces, dressings and spreads`, the child F-12 creates |

- Each new category is a plain browse heading with no assessment of its own. This feature authors no
  guidance, so it authors no `scopeStatement` and no citation.
- `Confectionery`, `Ingredients and additives`, and `Soups` are authored as root categories, siblings
  of `Breads and cereals`, `Dairy`, `Desserts`, `Drinks`, and the rest. They are ordinary food groups
  a reader would expect to browse, not a corner of `Miscellaneous`, and F-15 removes the coverage
  containment that previously made a new root a display problem.
- `Orange juice` becomes a food beneath `Fruit juice, kombucha and cider (non-alcoholic)`, alongside
  the existing `Pasteurised…` and `Unpasteurised…` children. It is deliberately not filed beneath
  either of those, because the vegetarian rule about added fish-derived omega-3 has nothing to do with
  pasteurisation and the article does not say which kind of juice it means.
- Every migrated food keeps its existing vegetarian assessment and continues to display it unchanged.
  Because F-15 removes coverage declarations entirely, no coverage edit of any kind is needed for
  this migration.
- Every migrated food that has no reviewed pregnancy rule displays the pregnancy list's single
  `Not assessed` state, both before and after the move, and that state does not change with the
  food's new parent. This is the behaviour F-15 establishes, and it is why F-15 is a prerequisite
  rather than a convenience: without it, foods moved under a new root would read
  `Outside current coverage` purely because of where they now sit.
- No pregnancy assessment is authored for any migrated food, including `Wine and beer`. Authoring one
  would be new guidance from an unreviewed source, which F-04's curation rules forbid.
- Every new category needs an authored `sortOrder` that positions it deliberately among its siblings.
  Any new root takes its alphabetical position under the root ordering
  [F-13](<13-surface-raw-egg-foods.md>) establishes, and the roots are re-numbered after the retirement
  so no gap or duplicate `sortOrder` is left behind.
- Search continues to reach every migrated food by its existing name and aliases. Because category-path
  labels are searchable, a food's matchable text changes with its new ancestry; no alias is added,
  removed, or edited to compensate.

## Non-goals

- Changing any status, summary, condition, scenario, citation, or reason link on any food.
- Adding, removing, or renaming any food record. This feature only re-parents existing ones.
- Retiring mirror foods or lifting rules onto categories. That is [F-12](<12-lift-group-guidance-onto-categories.md>).
- Creating the `Desserts` and `Drinks` roots, `Cold desserts`, or
  `Commercial sauces, dressings and spreads`. Those come from F-12 and F-13; this feature consumes
  them and fails fast if they are absent.
- Moving `Panna cotta`, which F-13 already moves.
- Extending what either guidance list assesses, or adding a new guidance list. No migrated food gains
  an assessment in any list.
- Restructuring `Breads` or `Miscellaneous`. `Tortillas` under `Breads` and `French fries` under
  `Miscellaneous` are accepted as good-enough homes now, and a later feature may refine either.
- Introducing a redirect for the retired category URL. The application is unreleased, consistent with
  F-09 and F-12.

## Assumptions and open questions

- This applies accepted ADRs rather than making a new decision, so it needs no new ADR. The category
  tree is authored data under an existing ADR, and re-parenting a food is a content change. The one
  architectural question this feature raised — whether a new root category should change a food's
  displayed state — is decided by the
  [single not-assessed state ADR](<../decisions/2026-08-07 ADR - resolve unassessed guidance from a single not-assessed state.md>)
  and delivered by F-15.
- The dependency on F-12 and F-13 is a real prerequisite, not an affinity: six of the fourteen foods
  land in categories that only exist once those features ship. The dependency on F-15 is equally
  real: without it, filing foods under new roots would flip them to `Outside current coverage`. This
  feature must not move to `Planned` until all three are `Done`.
- Retiring the category removes `/category/foods-that-may-contain-animal-derived-ingredients`. No
  content is lost, because the category carries no assessment.
- Resolved: `French fries` goes to `Miscellaneous` rather than under `Vegetables`. It is a prepared
  food rather than a vegetable as a reader thinks of one.
- Resolved: `Tortillas` goes to `Breads`, accepted as provisional pending any later bread or flatbread
  restructure.
- Resolved: `Confectionery`, `Ingredients and additives`, and `Soups` are root categories rather than
  children of `Miscellaneous`. They read as ordinary food groups, and once F-15 lands there is no
  coverage consequence to weigh against that legibility. This supersedes the earlier open question
  about roots versus children.
- Resolved: migrated foods with no reviewed pregnancy rule display `Not assessed`, and no pregnancy
  guidance is authored to avoid that.
- **Reviewed and accepted before publication:** `Confectionery`, `Ingredients and additives`, `Soups`,
  `Baked desserts`, and `Alcoholic drinks` are editorial groupings this feature invents, not headings
  any reviewed source states. A maintainer reviewed them on 2026-08-08 and confirmed they read as
  neutral browse headings, carry no assessment, scope statement, or citation, and are never presented
  as something a source claims. The `Ingredients and additives` placement was confirmed rather than
  overturned.
- Resolved, reversibly: `Gelatin` and `White sugar` go to `Ingredients and additives`. The heading is
  the weakest of the new ones, but it names a food group rather than a reason for assessment, which is
  the point of the feature. Overturning it in favour of `Miscellaneous` moves two `primaryCategoryId`
  values and deletes one category, so the content review gate in the implementation plan may reverse
  it without affecting anything else.

## Acceptance criteria

- No category, food, or assessment in the authored data references
  `foods-that-may-contain-animal-derived-ingredients`, and browsing the guide finds no such heading.
- Each of the thirteen foods this feature moves appears beneath its destination category in the browse
  view and on its own detail page's category path.
- `Orange juice` appears once in the guide, beneath `Fruit juice, kombucha and cider
  (non-alcoholic)`, and no juice entry appears outside the drinks subtree.
- Every migrated food's vegetarian status, summary, conditions, citation, and reason links are
  byte-identical to what they were before the migration.
- Filtering by the vegetarian scope returns the same set of guide entries and the same result count as
  before the migration.
- Searching each migrated food's existing name and aliases still reaches that food.
- Every migrated food with no reviewed pregnancy rule shows the pregnancy list's `Not assessed` state,
  the same state it showed before the move, and that state is not presented as safe.
- Content validation passes, including unknown-parent, unknown-category-reference, orphaned-category,
  duplicate-identifier, and subject-uniqueness rules, and fails if a food is left pointing at the
  retired category.

## Validation

Domain and content-validation unit tests covering the retired category's absence, each food's new
parent, and unchanged vegetarian resolution across the move. React Testing Library tests for the
browse view without the retired heading and for a migrated food's category path. Chromium Playwright
coverage for browsing to a migrated food through its new category and for a vegetarian-scoped filtered
URL returning the unchanged entry set; the existing `e2e/catalogue.spec.ts` scenario that expands the
retired heading is updated to a real food group. Repository-wide 100% statements, branches, functions,
and lines coverage for application source is retained. A subagent runs the `prepare` skill after
implementation and targeted validation, before the pull request is opened and before this feature
moves to `Done`.
