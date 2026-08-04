# 2026-08-04 ADR: Use Independent Guidance Lists for Food Assessments

**Status:** Accepted
**Date:** 2026-08-04
**Deciders:** Project owner (requester)

## Context and Problem Statement

Pregnancy food safety is the initial reason for the guide, but Polly is vegetarian and needs a
future list that can report vegetarian suitability. A food can be appropriate in one context and
conditional or inappropriate in another. Baking a single RAG value or fields such as
`isVegetarian` into the food entity would create duplicated catalogues and a new schema change for
every future perspective.

## Considered Options

- Independent guidance lists with list-owned status definitions and food/list assessments.
- One global RAG status plus special-case boolean/enum fields on `Food`.
- Separate food catalogues for pregnancy and vegetarian guidance.

## Decision Outcome

Chosen option: "independent guidance lists with a unique assessment per food/list pair", because
the shared food identity and hierarchy stay stable while every guidance perspective owns its status
vocabulary, citations, conditions, and review date.

### Consequences

- Good, because pregnancy safety and vegetarian suitability can coexist on one food without
  contradiction.
- Good, because a new list is a data/configuration addition instead of a food-schema rewrite.
- Good, because the UI can explain statuses in the correct context rather than treating all amber
  or red outcomes as identical.
- Bad, because filter and display code must receive an explicit active list.
- Bad, because missing assessment needs carefully presented in-scope and out-of-coverage fallbacks.
- Bad, because combined filters require documented semantics rather than an implicit global status.

## Decision Drivers

- A food's suitability is contextual, not intrinsic.
- Pregnancy statuses and vegetarian statuses have different words and conditions even when they use
  the same visual RAG tones.
- The future list must share aliases, category paths, citations, and detail routes where possible.
- Uncertainty must be visible rather than being collapsed into a false favourable result.

## Pros and Cons of the Options

### Independent guidance lists with food/list assessments

- Good, because `GuidanceList` defines its own statuses and distinct grey fallback statuses while
  `FoodAssessment` holds its food-specific rule.
- Good, because one food can be green for vegetarian suitability and amber for pregnancy guidance.
- Bad, because data integrity must ensure status IDs belong to the list and each pair is unique.

### One global RAG status with food fields

- Good, because the initial pregnancy screen could appear simpler.
- Bad, because "red" cannot explain whether the cause is pregnancy risk, animal-derived
  ingredients, or a future concern, and every new list requires code/schema changes.

### Separate food catalogues

- Good, because each list can be implemented independently.
- Bad, because names, aliases, hierarchy, routes, and content corrections would diverge and users
  could not compare contexts for the same food.

## Implementation Plan

- **Affected paths:** `src/domain/guidanceList.ts`, `src/domain/assessment.ts`,
  `src/domain/filtering.ts`, `src/data/guidanceLists.*`, `src/data/assessments.*`,
  `src/features/catalogue/`, `src/features/filters/`, and `src/features/food-detail/`.
- **Pattern to follow:** Define list statuses as
  `{ id, slug, label, tone, sortOrder, filterLabel }`, with unique IDs/slugs/labels and distinct
  grey `unassessedStatusId` and `outOfCoverageStatusId` values.
  Define a list coverage declaration. Define `FoodAssessment` with one food ID, one list ID, one
  list-owned non-fallback status ID, summary, guidance scenarios, citations, and review date. The
  absence of an assessment resolves from coverage. Use `v=1&list=<display-list-slug>` for the
  displayed list and `status.<list-slug>` only for labelled constraint filters. Do not add
  context-specific booleans to `Food`.
- **Tests:** Validate unique food/list assessment pairs, status ownership, fallback invariants, and
  coverage resolution. Test list switching, direct list-specific URLs, list-specific labels, and
  filters that OR selected statuses within a list but AND predicates from different lists.

## Confirmation

- [ ] Pregnancy food safety is represented as a `GuidanceList`, not as fields on `Food`.
- [ ] A future vegetarian list can define its own statuses without changing the food schema.
- [ ] Each `(foodId, guidanceListId)` pair has no more than one assessment.
- [ ] Distinct grey in-scope and out-of-coverage fallbacks resolve when no assessment exists.
- [ ] The UI presents status label and meaning in addition to its RAG tone.
- [ ] Multi-list filtering follows the documented OR-within-list/AND-across-lists rule and labels
  constraint-only list filters.

## More Information

This ADR governs Feature 05,
[`docs/features/05-add-independent-guidance-lists.md`](../features/05-add-independent-guidance-lists.md),
and complements the category-tree and static-content ADRs. It should be reconsidered only if a
future requirement needs assessments for a different entity type, such as a recipe or branded
product.
