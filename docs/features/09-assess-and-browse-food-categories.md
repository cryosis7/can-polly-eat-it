# F-09: Assess and Browse Food Categories

**Status:** Proposed

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

## Assumptions and open questions

- The catalogue budget of 2,000 foods and 500 categories still holds, so a content index built once
  per render keeps ancestor resolution well inside budget.
- Retiring the generic food records changes their public URLs from `/food/<slug>` to
  `/category/<slug>`. The application is unreleased, so no redirect or migration is required.
- Open question: whether the hard-cheese "check the label for animal rennet" rule is the correct and
  sufficient vegetarian statement for Gouda, or whether Gouda needs its own assessment. The reviewed
  content decides; the model supports either. [F-10](<10-vary-citation-expectations-by-list.md>)
  removes the blocker that previously made the group-level rule unauthorable, and the vegetarian
  list's coverage description must be reworded during this migration because it is no longer bounded
  by one article.

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
  no merged guidance, a 1,000-level ancestor walk, and each new validation failure.
- React Testing Library tests for inherited versus authored rendering, category guidance on group
  headings, and the category detail page.
- Chromium Playwright scenarios for a direct category URL and a filtered URL whose results include
  both an inheritance-only food and a category entry.
- `npm run test:coverage` retaining the 100% global threshold, plus `npm run lint`,
  `npm run typecheck`, and `npm run build`.
- A subagent runs the `prepare` skill after implementation and targeted validation, before the pull
  request is opened and before this feature moves to `Done`.
