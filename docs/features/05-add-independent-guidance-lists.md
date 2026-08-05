# F-05: Add Independent Guidance Lists

**Status:** Done

**Depends on:** [F-01: Browse the Food Guide](<01-browse-food-guide.md>), [F-02: Search and Filter Foods](<02-search-and-filter-foods.md>), [F-03: Explain Food Guidance](<03-explain-food-guidance.md>), and [F-04: Maintain Trustworthy Guidance Content](<04-maintain-trustworthy-guidance-content.md>)

**Governing decisions:** [independent guidance lists](<../decisions/2026-08-04 ADR - use independent guidance lists for food assessments.md>), [version-controlled static content](<../decisions/2026-08-04 ADR - store reviewed guide content as version-controlled static data.md>), [canonical reason foods](<../decisions/2026-08-04 ADR - link assessments to canonical reason foods.md>), [remove temporal freshness metadata](<../decisions/2026-08-05 ADR - remove temporal freshness metadata from guidance content.md>), and [scoped guidance with generic outcome filters](<../decisions/2026-08-06 ADR - show scoped guidance with generic outcome filters.md>)

## Goal

Add vegetarian suitability and future food perspectives to one catalogue without turning food
classification into a growing set of hard-coded booleans.

## Primary experience

1. Start with pregnancy food safety selected and add vegetarian suitability when both constraints
   matter.
2. Read each selected scope's status in the vocabulary appropriate to that list.
3. Filter selected scopes by generic outcome bands without duplicating food records.
4. Open the same food detail with preserved scope/outcome context and read every independently
   resolved guidance section.

## Required behaviour

- A new list supplies its own title, description, coverage declaration, source citation, distinct
  grey fallback states, statuses, and assessments.
- A food may have one assessment per list; it does not gain a new property such as
  `isVegetarian`.
- Missing assessment is represented as "Not assessed" inside the list's coverage or "Outside current
  coverage" outside it.
- Status colour is controlled by the list definition while label and meaning remain list-specific.
- Composite or brand-dependent foods use an explicit "Check ingredients" style outcome rather than
  an unjustified binary answer. A cited reason can link to a canonical ingredient food such as
  Gelatin, but the composite food retains its own list-specific assessment.
- Cross-list filtering follows the documented semantics: selected generic outcomes are alternatives
  within every selected scope and selected scopes are cumulative constraints; every active scope or
  outcome is visibly labelled.

## Non-goals

- Ingredient-level recipe analysis.
- Vegan, halal, allergy, or other lists unless they are separately reviewed and added as a new
  guidance-list configuration.
- User-specific dietary preference profiles.

## Implementation plan

Implement according to [the F-05 implementation plan](<05-add-independent-guidance-lists-plan.md>).

## Assumptions and open questions

- The maintainer approved Veggy Malta's "15 Products Not Vegetarian" article as a vetted source.
  This first list covers only article-named items, with source links and exact locators retained.
- A source omission or ambiguity remains outside coverage; no suitability is inferred from a food
  name, category, or ingredient.
- The maintainer approved the article-only coverage, assessment statuses, source locators, and
  paraphrases on 2026-08-05.

## Acceptance criteria

- The same food can show different independently resolved list outcomes; the source-backed Yoghurt
  fixture is `Not assessed` for pregnancy safety and `Check ingredients` for vegetarian suitability.
- Adding a vegetarian list does not create a second set of category or food records.
- A food inside vegetarian coverage without an assessment is labelled "Not assessed", while an
  uncovered food is labelled "Outside current coverage", never "Vegetarian".

## Validation

When implemented, retain the repository-wide 100% global statements, branches, functions, and lines
coverage thresholds for application source. Add Chromium Playwright tests for selected dietary
scopes, list-specific status labels, generic outcome filters, and direct scoped food-detail URLs.
