# F-14: Retire the Animal-Derived Ingredients Category

**Status:** Proposed

**Depends on:** [F-04: Maintain Trustworthy Guidance Content](<04-maintain-trustworthy-guidance-content.md>), [F-12: Lift Group-Level Guidance onto Categories](<12-lift-group-guidance-onto-categories.md>), [F-13: Surface Raw-Egg Foods Where People Browse for Them](<13-surface-raw-egg-foods.md>)

**Governing decisions:** [model food groups as an unbounded category tree](<../decisions/2026-08-04 ADR - model food groups as an unbounded category tree.md>), [use independent guidance lists for food assessments](<../decisions/2026-08-04 ADR - use independent guidance lists for food assessments.md>), [assess categories as first-class subjects with inherited guidance](<../decisions/2026-08-06 ADR - assess categories as first-class subjects with inherited guidance.md>), and [store reviewed guide content as version-controlled static data](<../decisions/2026-08-04 ADR - store reviewed guide content as version-controlled static data.md>)

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
  | `gummy-bears`, `jelly`, `marshmallows`, `starburst` | new `Confectionery` |
  | `gelatin`, `white-sugar` | new `Ingredients and additives` |
  | `vegetable-soup` | new `Soups` |
  | `french-fries` | `Miscellaneous` directly |
  | `tortillas` | `Breads` |
  | `orange-juice` | `Fruit juice, kombucha and cider (non-alcoholic)` |
  | `wine-and-beer` | new `Alcoholic drinks` beneath the `Drinks` root F-13 creates |
  | `worcestershire-sauce` | `Commercial sauces, dressings and spreads`, the child F-12 creates |

- Each new category is a plain browse heading with no assessment of its own. This feature authors no
  guidance, so it authors no `scopeStatement` and no citation.
- `Orange juice` becomes a food beneath `Fruit juice, kombucha and cider (non-alcoholic)`, alongside
  the existing `Pasteurised…` and `Unpasteurised…` children. It is deliberately not filed beneath
  either of those, because the vegetarian rule about added fish-derived omega-3 has nothing to do with
  pasteurisation and the article does not say which kind of juice it means.
- The vegetarian list's coverage is declared by `foodIds`, not by category, so every migrated food
  stays inside vegetarian coverage across the move with no coverage edit at all. The declared coverage
  `description` still describes the article's foods accurately and is not rewritten.
- Because the retired root sits outside pregnancy coverage today, every migrated food currently renders
  as `Outside current coverage` in the pregnancy list. After the move each one sits inside a
  pregnancy-covered subtree and renders as `Not assessed` instead. This is accepted deliberately: the
  two states are distinct, neither means safe, and `Not assessed` is the honest one — the food is now
  inside the pregnancy guide's declared scope and simply has no reviewed pregnancy rule.
- No pregnancy assessment is authored for any migrated food, including `Wine and beer`. Authoring one
  would be new guidance from an unreviewed source, which F-04's curation rules forbid.
- Every new category needs an authored `sortOrder` that positions it deliberately among its siblings,
  and the roots vacated by the retirement are re-numbered so no gap or duplicate `sortOrder` is left
  behind.
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
- Extending either guidance list's coverage, or adding a new guidance list.
- Restructuring `Breads` or `Miscellaneous`. `Tortillas` under `Breads` and `French fries` under
  `Miscellaneous` are accepted as good-enough homes now, and a later feature may refine either.
- Introducing a redirect for the retired category URL. The application is unreleased, consistent with
  F-09 and F-12.

## Assumptions and open questions

- This applies accepted ADRs rather than making a new decision, so it needs no new ADR. The category
  tree is authored data under an existing ADR, and re-parenting a food is a content change.
- The dependency on F-12 and F-13 is a real prerequisite, not an affinity: six of the fourteen foods
  land in categories that only exist once those features ship. This feature must not move to `Planned`
  until both are `Done`.
- Retiring the category removes `/category/foods-that-may-contain-animal-derived-ingredients`. No
  content is lost, because the category carries no assessment.
- Resolved: `French fries` goes to `Miscellaneous` rather than under `Vegetables`. It is a prepared
  food rather than a vegetable as a reader thinks of one.
- Resolved: `Tortillas` goes to `Breads`, accepted as provisional pending any later bread or flatbread
  restructure.
- Resolved: migrated foods are allowed to render as `Not assessed` in the pregnancy list, and no
  pregnancy guidance is authored to avoid that.
- **Needs review before publication:** `Confectionery`, `Ingredients and additives`, `Soups`,
  `Baked desserts`, and `Alcoholic drinks` are editorial groupings this feature invents, not headings
  any reviewed source states. They must read as neutral browse headings and must never be presented as
  something a source claims.
- Open: `Gelatin` and `White sugar` are ingredients rather than dishes, and `Ingredients and
  additives` is the weakest of the new headings. If review prefers it, both could sit directly under
  `Miscellaneous` instead, at the cost of a less legible browse tree.
- Open: whether `Ingredients and additives` and `Confectionery` are roots or children of
  `Miscellaneous`. Making them roots is more legible; making them children keeps the root list short
  and keeps them inside pregnancy coverage as they already will be.

## Acceptance criteria

- No category, food, or assessment in the authored data references
  `foods-that-may-contain-animal-derived-ingredients`, and browsing the guide finds no such heading.
- Each of the thirteen foods this feature moves appears beneath its destination category in the browse
  view and on its own detail page's category path.
- `Orange juice` appears once in the guide, beneath `Fruit juice, kombucha and cider
  (non-alcoholic)`, and no juice entry appears outside the drinks subtree.
- Every migrated food's vegetarian status, summary, conditions, citation, and reason links are
  byte-identical to what they were before the migration, and each still resolves inside vegetarian
  coverage.
- Filtering by the vegetarian scope returns the same set of guide entries and the same result count as
  before the migration.
- Searching each migrated food's existing name and aliases still reaches that food.
- Migrated foods show the pregnancy list's `Not assessed` state, not `Outside current coverage`, and
  neither state is presented as safe.
- Content validation passes, including unknown-parent, unknown-category-reference, orphaned-category,
  duplicate-identifier, coverage-containment, and subject-uniqueness rules, and fails if a food is left
  pointing at the retired category.

## Validation

Domain and content-validation unit tests covering the retired category's absence, each food's new
parent, coverage containment for the migrated foods in both lists, and unchanged vegetarian resolution.
React Testing Library tests for the browse view without the retired heading and for a migrated food's
category path. Chromium Playwright coverage for browsing to a migrated food through its new category
and for a vegetarian-scoped filtered URL returning the unchanged entry set; the existing
`e2e/catalogue.spec.ts` scenario that expands the retired heading is updated to a real food group.
Repository-wide 100% statements, branches, functions, and lines coverage for application source is
retained. A subagent runs the `prepare` skill after implementation and targeted validation, before the
pull request is opened and before this feature moves to `Done`.
