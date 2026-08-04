# 2026-08-04 ADR: Model Food Groups as an Unbounded Category Tree

**Status:** Accepted
**Date:** 2026-08-04
**Deciders:** Project owner (requester)

## Context and Problem Statement

Food guidance is naturally hierarchical: dairy contains cheese, cheese contains hard cheese, and
hard cheese contains named foods. The hierarchy is editorial and may gain more levels over time.
The application must render and filter that structure without coupling the data shape to the
currently observed number of levels.

## Considered Options

- A category adjacency list with `parentId`, a derived tree, and separate food records.
- A recursively nested category JSON document with foods embedded at leaves.
- A fixed set of category columns or enums, such as group/subgroup/item.

## Decision Outcome

Chosen option: "a validated adjacency-list category tree with separate food records", because
parent references can represent arbitrary depth, retain stable IDs for links and editorial changes,
and allow a category to contain both direct foods and child groups.

### Consequences

- Good, because `Dairy -> Cheese -> Hard cheese` and deeper future paths need no schema change.
- Good, because foods are reusable records with aliases and assessments rather than being nested
  category payloads.
- Good, because category-subtree filters are a deterministic domain operation.
- Bad, because malformed parent references and cycles must be explicitly detected.
- Bad, because moving a category changes its visual path and requires careful editorial review.
- Bad, because deeply nested or very large catalogues need a flattening/presentation strategy rather
  than naive recursive rendering.

## Decision Drivers

- No credible maximum category depth is known.
- Food names, aliases, citations, and assessments need a stable identity independent of grouping.
- The catalogue must display direct foods alongside nested child categories.
- Future lists must reuse categories and foods rather than define their own parallel hierarchy.

## Pros and Cons of the Options

### Category adjacency list with separate foods

- Good, because each category has a simple `id`, `slug`, `name`, `parentId`, `aliases`, and
  `sortOrder`, while each food references its `primaryCategoryId`.
- Good, because content diffs are local when adding a child group or moving a food.
- Bad, because rendering needs a tree builder rather than a direct nested document traversal.

### Recursively nested category JSON document

- Good, because it resembles the display hierarchy.
- Bad, because moving, referencing, validating, and reusing deep nodes are more error-prone and
  lead to duplicated food details or awkward references.

### Fixed category columns or enums

- Good, because it is simple for the currently known table structure.
- Bad, because a new depth or alternate grouping requires a data schema and UI migration, directly
  conflicting with the product requirement.

## Implementation Plan

- **Affected paths:** `src/domain/category.ts`, `src/domain/categoryTree.ts`,
  `src/domain/contentValidation.ts`, `src/data/categories.*`, `src/data/foods.*`, and
  `src/features/catalogue/`.
- **Pattern to follow:** Store `parentId: null` for roots and an ID for every non-root category.
  Derive a forest, category path, and flattened display rows at runtime. Foods reference exactly one
  existing `primaryCategoryId`; categories can have child categories and direct foods. Do not add a
  product-defined depth constant, map heading levels to depth, or rely on recursive rendering.
  Support up to 2,000 foods and 500 categories initially; a change beyond either budget requires a
  measured performance review and a new ADR.
- **Tests:** Validate unknown parents, self-parent links, cycles, duplicate IDs/slugs, and unknown
  food categories. Test a 1,000-level domain-only tree, direct foods plus children, stable
  editorial sort order, full breadcrumbs, and descendant category filtering.

## Confirmation

- [ ] The authored category schema contains `parentId` rather than fixed-depth fields.
- [ ] The validator rejects all category cycles and orphaned parent references.
- [ ] A 1,000-level domain-only fixture completes without a stack overflow.
- [ ] Readable UI fixtures expose a full category breadcrumb and depth-safe indentation.
- [ ] A category filter includes all descendant foods.
- [ ] A food's assessments and aliases remain on the food record, not in a category-node copy.
- [ ] The implementation has no hard-coded hierarchy-depth limit.

## More Information

This ADR implements the hierarchy in
[`docs/architecture/overview.md`](../architecture/overview.md) and enables Feature 01,
[`docs/features/01-browse-food-guide.md`](../features/01-browse-food-guide.md). It is intentionally
separate from suitability status, which is governed by the independent-guidance-lists ADR.
