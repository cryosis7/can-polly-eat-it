# 2026-09-21 ADR: model catalogue subjects and preparation independently

**Status:** Accepted  
**Date:** 2026-09-21  
**Deciders:** Product owner

## Context and Problem Statement

Foods belong in a natural browse hierarchy, but health sources may assess a whole group and may give
different advice for the way a food is prepared. Modelling preparation as category branches would
file one food several times and confuse catalogue structure with guidance.

## Considered Options

- An unbounded category adjacency list with separate food records and a global preparation
  dimension.
- A nested category document with foods copied into preparation branches.
- Fixed category levels and preparation-specific food records.

## Decision Outcome

Chosen option: "an unbounded category adjacency list with separate food records and a global
preparation dimension", because what a food is, where it is browsed, and how it is eaten remain
independent facts.

Categories use stable IDs and `parentId` references and may contain both direct foods and child
categories. Foods are filed once through `primaryCategoryId`. Categories and foods are both valid
guidance subjects; an assessed category becomes a searchable, routable guide entry.

Preparation uses one global vocabulary. A food declares only states in which people in New Zealand
actually eat it; that declaration expresses no risk. Assessments may qualify their authored rule by
preparation. Catalogue rows and category preparation bands are derived, not authored as extra
categories.

The tree has no product-defined depth limit. Rendering uses flattened rows and complete breadcrumbs.
The current content budget is 2,000 foods and 500 categories; exceeding it requires measured
performance evidence and a new decision.

### Consequences

- Good, because deeper categories and new preparation states need no schema migration.
- Good, because a food keeps one identity, route, alias set, and category location.
- Bad, because validation must detect cycles, unknown references, and invalid preparation use.
- Bad, because row derivation is more involved than rendering a nested authored document.

## Implementation Plan

- **Affected paths:** `src/data/categories.ts`, `src/data/foods.ts`, `src/data/preparations.ts`,
  `src/domain/categoryTree.ts`, `src/domain/schemas.ts`, and catalogue/detail surfaces.
- **Pattern to follow:** Derive the tree and preparation bands iteratively; never infer a preparation
  from cuisine theory or turn a preparation into a category.
- **Tests:** Relationship validation, a 1,000-level tree fixture, category breadcrumbs, descendant
  filtering, and preparation-specific catalogue and detail journeys.

## Confirmation

- [x] Categories use parent references and foods reference one primary category.
- [x] Tree building and rendering have no hard-coded depth ceiling.
- [x] Preparation is a shared vocabulary referenced by foods and assessments.
- [x] An assessed category is searchable, filterable, countable, and directly routable.
