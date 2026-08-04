# Feature 05: Add Independent Guidance Lists

## Goal

Add vegetarian suitability and future food perspectives to one catalogue without turning food
classification into a growing set of hard-coded booleans.

## Primary experience

1. Select the pregnancy or vegetarian list from the catalogue.
2. Read statuses in the vocabulary appropriate to that list.
3. Filter by statuses within the selected list, or intentionally apply compatible filters across
   lists.
4. Open the same food detail with `v=1&list=<list-slug>` and switch lists without navigating to a
   duplicated catalogue.

## Required behaviour

- A new list supplies its own title, description, coverage declaration, source-version evidence,
  distinct grey fallback states, statuses, and assessments.
- A food may have one assessment per list; it does not gain a new property such as
  `isVegetarian`.
- Missing assessment is represented as "Not assessed" inside the list's coverage or "Outside current
  coverage" outside it.
- Status colour is controlled by the list definition while label and meaning remain list-specific.
- Composite or brand-dependent foods use an explicit "Check ingredients" style outcome rather than
  an unjustified binary answer. A cited reason can link to a canonical ingredient food such as
  Gelatin, but the composite food retains its own list-specific assessment.
- Cross-list filtering follows the documented semantics: OR for selected statuses within one list,
  AND for predicates from different lists; every cross-list constraint is visibly labelled.

## Not in this feature

- Ingredient-level recipe analysis.
- Vegan, halal, allergy, or other lists unless they are separately reviewed and added as a new
  guidance-list configuration.
- User-specific dietary preference profiles.

## Test confidence

Tests for this feature must retain the repository-wide 90% global branch-coverage threshold for
application source once the coverage policy is implemented.

## Acceptance examples

- The same named cheese can be green for vegetarian suitability and amber for pregnancy safety.
- Adding a vegetarian list does not create a second set of category or food records.
- A food inside vegetarian coverage without an assessment is labelled "Not assessed", while an
  uncovered food is labelled "Outside current coverage", never "Vegetarian".
