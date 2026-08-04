# 2026-08-04 ADR: Link Assessments to Canonical Reason Foods

**Status:** Accepted
**Date:** 2026-08-04
**Deciders:** Project owner (requester)

## Context and Problem Statement

A composite food may be unsuitable because it contains an ingredient that Polly cannot have, such as
gelatin for vegetarian suitability. Free-text notes can describe that fact, but cannot reliably
link users to the canonical ingredient record or keep reason wording consistent. The application
needs an explainable relationship while preserving the rule that each food assessment is reviewed
and cited independently.

## Considered Options

- Add typed assessment reason links to existing canonical food records.
- Keep reasons as unstructured notes only.
- Add standalone concern entities for ingredients and abstract risks.
- Infer a composite food's status from its ingredient records.

## Decision Outcome

Chosen option: "typed assessment reason links to existing canonical food records", because it makes
a reason such as "Contains gelatin" navigable while retaining a single food catalogue and avoiding
status inference from incomplete ingredient data.

### Consequences

- Good, because a food-detail page can explain an outcome and link to the canonical Gelatin detail
  page without duplicating ingredient information.
- Good, because future guidance lists can use the same relationship when a cited reason is a
  catalogue food.
- Good, because it remains possible to add a composite food as "Check ingredients" when no
  ingredient-specific conclusion is justified.
- Bad, because editorial data must maintain valid reason targets and citations for the assessed food.
- Bad, because non-food concepts cannot be linked until a future ADR deliberately introduces a
  separate entity model.
- Bad, because consumers must not mistake a reason link for an automatically inherited assessment.

## Decision Drivers

- Gelatin is a common ingredient-level reason for a vegetarian outcome.
- The first release needs a simple explanation path without a separate knowledge-graph product.
- Pregnancy safety, vegetarian suitability, and future guidance lists remain independently reviewed.
- Catalogue cards must remain concise; the explanation belongs on the food-detail view.

## Pros and Cons of the Options

### Typed assessment reason links to existing canonical food records

- Good, because a link has a clear target and semantic kind such as `contains`, `derived-from`, or
  `made-with`.
- Good, because the relationship can be validated in the existing static content contract.
- Bad, because an author must create a canonical food record before using it as a target.

### Unstructured notes only

- Good, because it has no new data relationship or validator.
- Bad, because "gelatin" cannot reliably become a navigable canonical detail page and wording is
  easier to duplicate or drift.

### Standalone concern entities

- Good, because they could eventually represent abstract concepts such as contamination risks.
- Bad, because they expand the first-release taxonomy beyond the confirmed need for ingredient food
  links and require a separate lifecycle, citations, and UI.

### Inferred composite-food status

- Good, because it appears to reduce editorial work.
- Bad, because missing, conditional, brand-specific, or quantity-dependent ingredients would create
  unsafe conclusions without a reviewed citation for the composite food.

## Implementation Plan

- **Affected paths:** `src/domain/assessment.ts`, `src/domain/contentValidation.ts`,
  `src/data/assessments.*`, `src/features/food-detail/`, and associated tests.
- **Pattern to follow:** Add `reasonLinks` to `FoodAssessment`. Each link contains
  `kind`, `targetFoodId`, and an authored `statement`. Allow only `contains`, `derived-from`,
  `made-with`, and `other`; require an existing non-self food target, non-empty statement, and no
  duplicate `(kind, targetFoodId)` pair per assessment. Render reason links on the detail page only.
  Keep the assessed food's own citation authoritative and never derive status from the target.
- **Tests:** Validate invalid/missing/self/duplicate targets. Render a vegetarian composite fixture
  with "Contains [Gelatin]" and verify the link target, the absence of that link on catalogue cards,
  and no change to status when the target assessment is absent or different.

## Confirmation

- [ ] A `FoodAssessment` supports zero or more typed reason links to existing food IDs.
- [ ] Content validation rejects an unknown target, a self-link, duplicate kind/target pair, or
  empty statement.
- [ ] A food detail renders the authored reason statement and target-food link.
- [ ] Catalogue cards do not render reason links in the first release.
- [ ] An assessment's status and citation remain independently authored; no status is inherited from
  the linked target food.
- [ ] The implementation has no standalone concern entity or ingredient-based inference engine.

## More Information

This ADR extends the shared assessment model in
[`2026-08-04 ADR - use independent guidance lists for food assessments.md`](<2026-08-04 ADR - use independent guidance lists for food assessments.md>)
and governs the explanation behaviour in
[`docs/features/03-explain-food-guidance.md`](../features/03-explain-food-guidance.md).
