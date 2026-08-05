# F-05 implementation plan: Add independent guidance lists

## Scope and constraints

Add one `vegetarian-suitability` guidance list to the existing shared catalogue. It is limited to the
maintainer-vetted Veggy Malta “15 Products Not Vegetarian” article supplied on 2026-08-05. Preserve
one `Food` record per item; suitability remains a list-specific `FoodAssessment`.

The list uses the status vocabulary approved by the maintainer:

- `Vegetarian` (green)
- `Contains animal-derived ingredients` (red)
- `Check ingredients` (amber)
- `Not assessed` (grey fallback)
- `Outside current coverage` (grey fallback)

The source only supports red or amber outcomes for this draft. Do not assign a green outcome from an
article omission, generic name, category, or ingredient relationship. Source title, HTTPS URL, and
exact locators remain mandatory; temporal source metadata is not part of the contract under the
[temporal freshness metadata decision](<../decisions/2026-08-05 ADR - remove temporal freshness metadata from guidance content.md>).

## Ordered delivery

1. Complete the date-free static-content contract in `src/domain/`, `src/data/`, and the detail
   rendering, retaining validation for citations, coverage, statuses, and relationships.
2. Add the list-owned vegetarian statuses and food-ID-only coverage declaration in
   `src/data/guidanceLists.ts`. Its coverage must enumerate only source-named foods; no category
   subtree may silently broaden it.
3. Reuse `yoghurt`, then add canonical records only for article-named foods absent from
   `src/data/foods.ts`, placing them in existing categories without duplicating catalogue records.
4. Add only article-supported vegetarian assessments in `src/data/assessments.ts`:
   - use `Contains animal-derived ingredients` only where the article makes a direct assertion;
   - use `Check ingredients` for brand-, restaurant-, preparation-, or alternative-dependent items;
   - leave unsupported outcomes unassessed or outside coverage rather than inferring suitability.
5. Add a canonical Gelatin food only if used as a valid reason-link target, and add a reason link
   only for an assessment whose own citation supports the link and outcome.
6. Update domain tests to prove unique ownership, in-coverage/out-of-coverage resolution, and
   OR-within-list/AND-across-list filtering against the vegetarian list.
7. Update catalogue and detail rendering tests for list switching, list-specific labels, source
   locators, direct vegetarian detail routes, and the absence of duplicate food cards.
8. Add Chromium scenarios for the vegetarian displayed list, a cross-list filtered URL, and a direct
   vegetarian food-detail URL.
9. Run the complete coverage, browser, lint, type-check, and production-build quality gates. Review
   all source claims and the working-tree diff before moving F-05 to `Done`.

## Validation

- `npm test -- src/domain/contentValidation.test.ts src/domain/filtering.test.ts`
- `npm test -- src/features/catalogue/CataloguePage.test.tsx src/features/food-detail/FoodDetailPage.test.tsx`
- `npm run test:coverage`
- `npm run test:e2e`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
