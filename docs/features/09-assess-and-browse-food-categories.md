# F-09: Assess and Browse Food Categories

**Status:** Done

**Depends on:** [F-04: Maintain Trustworthy Guidance Content](<04-maintain-trustworthy-guidance-content.md>), [F-05: Add Independent Guidance Lists](<05-add-independent-guidance-lists.md>), [F-08: Rework Guidance-Scope Filtering](<08-rework-guidance-scope-filtering.md>), [F-10: Vary Citation Expectations by Guidance List](<10-vary-citation-expectations-by-list.md>)

**Governing decisions:** [assess categories as first-class subjects with inherited guidance](<../decisions/2026-08-06 ADR - assess categories as first-class subjects with inherited guidance.md>), [model food groups as an unbounded category tree](<../decisions/2026-08-04 ADR - model food groups as an unbounded category tree.md>), [use independent guidance lists](<../decisions/2026-08-04 ADR - use independent guidance lists for food assessments.md>), and [show scoped guidance with generic outcome filters](<../decisions/2026-08-06 ADR - show scoped guidance with generic outcome filters.md>)

## Goal

As Polly, I need guidance that a source gives for a whole food group to apply to every food in that
group, so that a newly added cheese tells me what to do instead of saying "Not assessed", and so that
I can look up "hard cheese" itself when I do not have a specific cheese in mind.

## Primary experience

1. Open the guide and see a category such as `Hard cheese` carrying its own guidance for the selected
   dietary scopes, alongside the named foods beneath it.
2. Open `Gouda`, which has no assessment of its own, and read the hard-cheese guidance with a clear
   statement that it applies to all hard cheese, a link to that category, and the category's own
   source and locator.
3. Open `Parmesan` and read its own vegetarian assessment, which replaces the hard-cheese rule
   entirely.
4. Search "custard" or "hard cheese" and reach the category's guidance directly.

```text
Dairy > Cheese > Hard cheese          Pregnancy: OK to eat
                                      Vegetarian: Check ingredients
  Cheddar     Pregnancy: OK to eat (applies to all hard cheese)
              Vegetarian: Check ingredients (applies to all hard cheese)
  Gouda       Pregnancy: OK to eat (applies to all hard cheese)
              Vegetarian: Check ingredients (applies to all hard cheese)
  Parmesan    Pregnancy: OK to eat (applies to all hard cheese)
              Vegetarian: Contains animal-derived ingredients
```

## Required behaviour

- A reviewed assessment can be authored against a category as well as against a food, in exactly one
  guidance list, with its own status, summary, citations, and an authored statement of the breadth of
  the claim.
- A food with no assessment of its own takes the guidance of its nearest assessed ancestor category
  in that guidance list; the existing in-coverage and outside-coverage grey fallbacks apply only when
  no ancestor is assessed.
- A food's own assessment replaces an ancestor's completely. Guidance is never blended across levels
  or across guidance lists.
- Wherever guidance is inherited, the interface says so, names the category it came from, and shows
  that category's source and locator.
- A category that carries its own authored assessment is a guide entry: it is searchable, obeys the
  scope and outcome filters, is included in the result count, and has its own detail page.
- The generic food records that only stand in for a category rule are retired; their guidance moves
  onto the categories themselves and remains findable.
- Adding a food to an assessed category requires no assessment edit for that food to show correct,
  cited guidance.

## Non-goals

- Inferring guidance from a food's name, from a sibling food, or from an ancestor that has no
  authored assessment.
- Computing, generating, or updating advice from tags, rules, ingredients, or a model.
- Merging a category's conditions with a food's conditions, or applying one guidance list's
  inheritance to another list.
- Adding an inheritance opt-out flag before a real exception exists; an exception is authored as a
  food-level assessment.
- Adding new dietary lists, or changing the reviewed pregnancy and vegetarian source content beyond
  the migration this feature requires.
- Making every category a guide entry; only categories with their own authored assessment qualify.

## Implementation plan

[F-09 Implementation Plan](<09-assess-and-browse-food-categories-plan.md>), approved and complete.

## Assumptions and open questions

- The catalogue budget of 2,000 foods and 500 categories still holds, so a content index built once
  per render keeps ancestor resolution well inside budget.
- Retiring the generic food records changes their public URLs from `/food/<slug>` to
  `/category/<slug>`. The application is unreleased, so no redirect or migration is required.
- Resolved: the hard-cheese "check the label for animal rennet" rule is authored as the sufficient
  vegetarian statement for Gouda; it has no food-level assessment of its own and inherits the category
  rule. Parmesan keeps its own food-level vegetarian assessment because animal-derived rennet in
  Parmesan specifically is well-established, which overrides the category rule entirely, as the model
  requires. [F-10](<10-vary-citation-expectations-by-list.md>) removes the blocker that previously made
  the group-level rule unauthorable, and the vegetarian list's coverage description is reworded during
  this migration because it is no longer bounded by one article.

## Acceptance criteria

- A food added beneath an assessed category shows that category's guidance, with its status, summary,
  citation, and a statement of the breadth of the claim, without any assessment being authored for
  it.
- A food with its own assessment shows only its own guidance, even when an ancestor category is
  assessed in the same guidance list.
- When two ancestors are assessed in the same guidance list, the nearer one is shown.
- Inherited guidance is visibly distinguishable from guidance authored for that food, and names the
  category it came from.
- A category with its own assessment can be found by search, is included in the result count, honours
  the scope and outcome filters, and opens at its own URL in a fresh browser session.
- Guidance that previously lived on a generic food record is still reachable, searchable, and
  filterable after that record is retired.
- Content validation fails when an assessed subject falls outside its guidance list's declared
  coverage, when a category assessment omits its statement of breadth, or when a subject is assessed
  twice in the same list.
- A food outside every assessed category and outside coverage still resolves to the distinct
  outside-coverage state, and a food inside coverage with no applicable assessment still resolves to
  "Not assessed"; neither is presented as safe.

## Validation

- Domain unit tests for nearest-ancestor precedence, food-level override, no cross-list inheritance,
  no merged guidance, a 1,000-level ancestor walk, and each new validation failure — added to
  `src/domain/assessment.test.ts` (new, 8 tests) and `src/domain/contentValidation.test.ts` (15 tests,
  including category-subject uniqueness/existence, `scopeStatement` ownership, and the new
  coverage-containment rule). `src/domain/filtering.test.ts` (11 tests) covers `filterCategoryEntries`
  and the hard-cheese food/category resolution. `src/domain/search.test.ts` (new, 5 tests) covers
  category-entry search matching. Result: pass.
- React Testing Library tests for inherited versus authored rendering, category guidance on group
  headings, and the category detail page — added to `src/features/catalogue/CataloguePage.test.tsx`
  (Gouda inheriting pregnancy and vegetarian hard-cheese guidance with disclosed provenance, Parmesan's
  own override, the `Hard cheese` category entry heading/link, and the "N results in the guide" count),
  `src/features/food-detail/FoodDetailPage.test.tsx` (Gouda's inherited guidance and category link), and
  the new `src/features/category-detail/CategoryDetailPage.test.tsx` (assessed-category guidance,
  not-found for an unknown or inheritance-only category slug). Result: pass.
- Chromium Playwright scenarios for a direct category URL and a filtered URL whose results include
  both an inheritance-only food and a category entry — added
  `loads an assessed category directly and shows its scoped guidance` and
  `shows an inheritance-only food and its origin category as guide entries on a filtered URL` to
  `e2e/catalogue.spec.ts`; all 16 scenarios pass.
- `npm run test:coverage`: 77/77 tests pass, 100% statements/branches/functions/lines retained across
  all application source.
- `npm run lint`: no errors.
- `npm run typecheck`: no errors.
- `npm run build`: succeeds.
- `npm run test:e2e`: all 16 Chromium scenarios pass.
- **Data migration note:** the fixture counts changed from 140 foods/141 assessments to 138 foods/134
  assessments (three pseudo-food records retired, `gouda` added; the hard-cheese and low-acid
  soft-pasteurised-cheese pregnancy specs and the three retired pseudo-food assessments became category
  assessments, and one uncited vegetarian `hard-cheese` category assessment was added), consistent with
  this feature's required behaviour.
- A subagent runs the `prepare` skill after implementation and targeted validation, before the pull
  request is opened and before this feature moves to `Done`.
- **Pre-PR `prepare` skill:** run against the pending diff (base `7ce6971`, branch
  `agents/feature-planning-implementation`, 24 files: 19 modified, 5 new; all uncommitted). Two
  attempts to delegate the whole skill to a background subagent were lost to a runtime fault (the
  agents were dispatched, ran, then disappeared from the agent registry without emitting a report), so
  the orchestration was performed directly and the two surviving checks were run against the same
  scope brief. Results:
  1. **Dependency versions — dropped, no input.** `package.json` and `package-lock.json` are unchanged
     in this diff (`git diff --name-status 7ce6971 -- package.json package-lock.json` returns
     nothing), so no dependency was added or bumped.
  2. **Documentation drift — two findings, both fixed.**
     - (Should-fix) `docs/features/08-rework-guidance-scope-filtering.md:72-82` (F-08, `Done`) carried
       a Mermaid class diagram declaring `class FoodAssessment { foodId ... }` and
       `FoodAssessment --> Food : assesses`. Contradicted by `src/domain/schemas.ts:84-95`, which now
       exports `Assessment` with a polymorphic `subject`. An agent reading F-08 to understand
       filtering would have taken the wrong type name and the wrong arity of the assessment
       relationship. Amended to `class Assessment { subject ... }` with both subject edges, and a
       `Category` class added so the new edge resolves. Fixed.
     - (Should-fix) `docs/features/05-add-independent-guidance-lists-plan.md:7` asserted in the present
       tense that "suitability remains a list-specific `FoodAssessment`". Qualified to name the
       current `Assessment` type and link to this feature. Fixed.
     - Considered and deliberately left alone: the `FoodAssessment` references in
       `docs/decisions/2026-08-04 ADR - use independent guidance lists for food assessments.md:51,75`,
       `... link assessments to canonical reason foods.md:79,90`, and
       `... adopt AI-assisted local draft curation for official sources.md:80`. ADRs are immutable
       point-in-time decision records, and the governing 2026-08-06 ADR already states at its line 239
       that it supersedes that resolution rule. Rewriting them would falsify the decision history.
       `docs/features/10-vary-citation-expectations-by-list-plan.md:28` was also left: it records an
       action taken against the schema as it was named at that time, which was accurate when written.
     - Surfaces checked: `docs/architecture/overview.md`, `.github/copilot-instructions.md`,
       `docs/decisions/index.md` and the four subject-relevant ADRs, `docs/implementation-plan.md`, and
       every `docs/features/*.md`. `docs/architecture/overview.md` and
       `.github/copilot-instructions.md` were verified line-by-line against the shipped code and are
       accurate: the `AssessmentSubject`/`Assessment` type block at `overview.md:194-208` matches
       `src/domain/schemas.ts:84-99` exactly, the `/category/:categorySlug` route at `overview.md:84`
       matches `src/app/App.tsx:29`, the `category-detail/` and `components/` layout entries at
       `overview.md:105-107` now exist, and the "count announces results rather than foods" convention
       matches `src/features/catalogue/CataloguePage.tsx`.
  3. **Missing documentation — no findings.** The governing ADR already specifies the content index,
     the guide-entry concept, the `scopeStatement` and coverage-containment validation rules, and the
     `src/components/` destination; `docs/architecture/overview.md` documents all of them for humans.
     The curation guardrail the ADR required was confirmed already present at
     `.agents/skills/ai-guidance-list-curation/SKILL.md:76-78`.
- **Deviations from the ADR's indicative implementation plan**, recorded rather than treated as
  defects, since an ADR implementation-plan section is indicative and the ADR's own `Confirmation`
  checklist is satisfied in full:
  - The ADR sketched a named `GuideEntry = { kind: 'food', food } | { kind: 'category', category }`
    union. The shipped code expresses the same concept as two sibling predicates,
    `filterFoods` and `filterCategoryEntries` in `src/domain/filtering.ts`, whose results the
    catalogue counts together. No consumer needed the boxed union, and avoiding it kept the existing
    `filterFoods` return shape intact for every current caller.
  - The ADR named the index map `assessmentsByListAndSubject` and sketched
    `createContentIndex(content)`. The shipped `src/domain/contentIndex.ts` uses
    `assessmentsBySubjectKey` keyed by `listId:kind:id`, and takes
    `createContentIndex(categories, assessments)` so that `contentValidation.ts` can build an index
    before a validated `ContentData` object exists.
