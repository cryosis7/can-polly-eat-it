# F-09 Implementation Plan: Assess and Browse Food Categories

**Status:** Approved, complete

**Feature:** [F-09: Assess and Browse Food Categories](<09-assess-and-browse-food-categories.md>)

**Governing decision:** [assess categories as first-class subjects with inherited guidance](<../decisions/2026-08-06%20ADR%20-%20assess%20categories%20as%20first-class%20subjects%20with%20inherited%20guidance.md>),
whose own "Implementation Plan" section is authoritative for the shape of this change. This document
translates that ADR into ordered delivery tasks against the code as it exists today, since
`docs/architecture/overview.md` and `.github/copilot-instructions.md` already describe the target
model but `src/` still uses the pre-ADR `FoodAssessment.foodId` shape.

## Constraints

- `src/domain/` stays free of React, router, and browser imports.
- The repository-wide 100% statements, branches, functions, and lines coverage threshold must hold.
- No new dependencies. No change to statuses, outcome bands, the `v=1` URL contract, or the
  medical-information disclaimer.
- Every assessed subject must fall inside its guidance list's declared coverage; this is a new
  validation rule this feature introduces (not previously enforced).
- Guidance is never merged across subject levels or across guidance lists; a food-level assessment
  always fully replaces an inherited one.
- Do not add an inheritance opt-out flag; an exception is authored as a food-level assessment
  (already true for Parmesan's vegetarian record).

## Delivery tasks

1. **Schema (`src/domain/schemas.ts`).** Add `assessmentSubjectSchema` as a discriminated union of
   `{ kind: 'food'; foodId }` and `{ kind: 'category'; categoryId }`. Rename `foodAssessmentSchema` to
   `assessmentSchema`, replacing `foodId` with `subject: assessmentSubjectSchema` and adding an
   optional `scopeStatement`. Rename the exported `FoodAssessment` type to `Assessment`.

2. **Content index (new `src/domain/contentIndex.ts`).** `createContentIndex(categories, assessments)`
   builds the `CategoryTree` once and a `Map<'listId:food:<id>' | 'listId:category:<id>', Assessment>`
   plus a `Set<categoryId>` of categories carrying their own assessment in any list
   (`assessedCategoryIds`, the guide-entry test). Export a `subjectKey` helper.

3. **Resolution (`src/domain/assessment.ts`).** Replace `resolveAssessment(food, list, assessments,
   categories)` with `resolveAssessment(subjectRef, guidanceList, index)` where `subjectRef` is
   `{ kind: 'food'; food }` or `{ kind: 'category'; category }`. Check the subject's own assessment
   first; for a food, then walk `index.tree.pathByCategoryId` for its primary category from nearest to
   root; for a category, walk its own path excluding itself. Return
   `{ status, assessment?, origin: { kind: 'own' } | { kind: 'inherited'; category } | { kind:
   'coverage-fallback' } }`. Fall back through `isFoodCovered`/`isCategoryCovered` exactly as before.
   The walk is iterative, so it is safe at 1,000 levels.

4. **Validation (`src/domain/contentValidation.ts`).**
   - `isFoodCovered`/new `isCategoryCovered` take a `ContentIndex` instead of rebuilding a tree.
   - Subject-aware uniqueness: dedupe on `${subjectKey}:${guidanceListId}`.
   - Subject-aware existence: a food subject must reference a known food; a category subject must
     reference a known category.
   - `scopeStatement` ownership: required and non-empty for a category subject, forbidden for a food
     subject.
   - New coverage-containment rule: every assessed subject (food or category) must be covered by its
     guidance list's declared coverage.
   - Reason-link self-reference check only applies when the subject is a food.
   - Keep every existing invariant (status ownership, fallback distinctness, citation policy).

5. **Search (`src/domain/search.ts`).** Change `foodSearchText`/`matchesSearchQuery` to take a
   `CategoryTree` instead of a raw `Category[]` (avoids rebuilding a lookup map per call). Add
   `categorySearchText`/`matchesCategoryQuery` matching a category's own name, aliases, and ancestor
   path labels, so both entry kinds behave symmetrically.

6. **Filtering (`src/domain/filtering.ts`).** `filterFoods` takes the content index instead of raw
   `categories`/`assessments`. Add `filterCategoryEntries(categories, guidanceLists, index, filters)`
   returning only categories in `index.assessedCategoryIds` that match the category filter, search,
   and cumulative scope/outcome predicates — reusing the same per-scope OR / cross-scope AND predicate
   as `filterFoods` via a shared `matchesGuidanceFilters` helper.

7. **Data migration (`src/data/`).**
   - `foods.ts`: remove the `breads`, `plain-cakes-slices-and-muffins`, and
     `cakes-slices-and-muffins-with-cream-or-custard` pseudo-food records (and their now-empty food
     groups); add `gouda` under `hard-cheese` with no assessment.
   - `assessments.ts`: convert the hard-cheese pregnancy spec (`cheddar`, `parmesan`) and the low-acid
     soft pasteurised cheese spec (8 foods) into single category assessments on `hard-cheese` and
     `low-acid-soft-pasteurised-cheese`, each with an authored `scopeStatement`. Convert the three
     retired pseudo-food assessments into category assessments on `breads`,
     `plain-cakes-slices-and-muffins`, and `cakes-slices-and-muffins-with-cream-or-custard`; keep
     `breakfast-cereals`, `rice`, `pasta` as their own food assessments. Add an uncited
     `vegetarian-check-ingredients` category assessment on `hard-cheese` (relies on the list's
     `evidentiaryBasis`, consistent with its optional citation policy). Keep Parmesan's existing
     food-level vegetarian assessment unchanged so it continues to override the category rule.
   - `guidanceLists.ts`: add `hard-cheese` to `vegetarian-suitability.coverage.categoryIds` and reword
     its coverage description, since coverage is no longer bounded by one article.

8. **Catalogue rendering (`src/features/catalogue/CataloguePage.tsx`).** Build one `ContentIndex` per
   render. Compute matched category entries alongside matched foods; the announced count becomes
   "N results in the guide" (foods plus matched category entries). A category heading whose category
   is a matched entry renders a link to `/category/<slug>` and its own resolved status chip per
   selected scope. A food card whose guidance is inherited renders the origin category's
   `scopeStatement` and a link to that category, in addition to the (already category-sourced)
   citation.

9. **Shared guidance rendering.** Extract the existing `GuidanceSection` out of `FoodDetailPage.tsx`
   into `src/components/GuidanceSection.tsx` so both food detail and the new category detail reuse one
   renderer, and add the inherited-provenance block there.

10. **Food detail (`src/features/food-detail/FoodDetailPage.tsx`).** Use the shared `GuidanceSection`
    and the new `resolveAssessment` signature.

11. **Category detail (new `src/features/category-detail/CategoryDetailPage.tsx` and an added
    `/category/:categorySlug` route in `src/app/App.tsx`).** Resolve the category by slug; if it is
    unknown or not in `assessedCategoryIds` (not a guide entry), render the same safe not-found pattern
    `FoodDetailPage` uses. Otherwise render its breadcrumb and a `GuidanceSection` per selected scope,
    resolved via `{ kind: 'category', category }`, plus the medical-information disclaimer.

12. **Styles (`src/index.css`).** Minimal, colour-independent styling for the category-entry heading
    guidance chips and the inherited-provenance note, following existing `.status`/`.tone-*`
    conventions.

## Tests

- `src/domain/contentValidation.test.ts`: category-subject assessments accepted; missing/forbidden
  `scopeStatement` rejected; duplicate `(subject, list)` pairs rejected for a category subject; an
  assessed subject outside its list's coverage rejected; `isCategoryCovered` behaviour.
- `src/domain/assessment.test.ts` (new): nearest-ancestor precedence, food-level override of an
  ancestor category rule, no inheritance across guidance lists, no merging of scenarios/citations
  across levels, a 1,000-level ancestor walk, and a category resolving via a grandparent category
  assessment.
- `src/domain/filtering.test.ts`: `filterCategoryEntries` matches by search/category/scope/outcome;
  a category that only inherits is excluded from entries.
- `src/features/catalogue/CataloguePage.test.tsx`: Gouda inherits pregnancy and vegetarian hard-cheese
  guidance with disclosed provenance; Parmesan's own vegetarian assessment still overrides; the
  `Hard cheese` category entry is searchable, filterable, and links to its detail route; the "N results
  in the guide" count includes matched category entries.
- `src/features/food-detail/FoodDetailPage.test.tsx`: inherited guidance shows the origin category,
  its `scopeStatement`, and its citation; an overriding food assessment shows only its own guidance.
- `src/features/category-detail/CategoryDetailPage.test.tsx` (new): renders `Hard cheese` guidance for
  the selected scopes with the disclaimer; a category with no own assessment renders the not-found
  state.
- `e2e/catalogue.spec.ts`: a direct `/category/hard-cheese` load, and a filtered URL whose results
  include Gouda (inheritance-only) and the `Hard cheese` category entry.
- `npm run test:coverage`, `npm run lint`, `npm run typecheck`, and `npm run build`.

## Validation

- `npm test -- src/domain/contentValidation.test.ts src/domain/assessment.test.ts src/domain/filtering.test.ts`
  for the fastest domain feedback, then the component suites, then the full suite.
- `npm run test:coverage`
- `npm run test:e2e`
- `npm run lint`
- `npm run typecheck`
- `npm run build`

## Pre-PR verification

After implementation and the targeted validation above, instruct a subagent to run the `prepare`
skill against this branch. It checks dependency versions, documentation the change has made untrue,
and undocumented new architecture, independently of the implementer. Record its result, or the
resolution of each finding, in F-09's `Validation` section before opening the pull request and before
moving the feature to `Done`.
