# 04: Pages and guidance rendering read only the content index

Category: enhancement
Status: done
Parent: [Make the content index the one handle on content](../spec.md)

**What to build:** The app shell passes the application's content index to the catalogue, food
detail, and category detail routes, and those pages and the guidance components take the index in
place of raw content. Detail pages stop rebuilding an index on every render. Guidance rendering finds
sources and reason-link target foods through index lookups rather than array scans. Page and
component tests build their index through the test-support helper, so content they edit is
validated. Readers see no change.

**Blocked by:** 02.

## Acceptance criteria

- [x] No page or guidance component takes raw content as a prop, and no page builds an index.
- [x] Pages resolve foods and categories from URL slugs through the index's slug lookups, and still
  show "Food not found" and "Category not found" (including a known but unassessed category).
- [x] Source names, dissent notices, and reason-link targets come from index ID lookups.
- [x] Guidance lists still render in authored order regardless of scope order in the URL.
- [x] Page and component tests that edit real content build their index through the helper; fixture
  edits follow ticket 03's rule of adding records rather than loosening assertions.
- [x] Coverage stays at 100%, ticket 01's tests pass unchanged, and the Playwright scenarios pass
  unmodified.

## Comments

### 2026-09-25 - Implemented

- Merged into `main` as `d114ac5`.
- `App` passes `contentIndex` to the catalogue, food detail, and category detail routes. Pages
  and `GuidanceSection`, `GuideEntrySummary`, and `DissentNotice` take an `index` prop. Source names,
  dissent notices, and reason-link foods use `sourceById` and `foodById`.
- Pulled forward from ticket 06: pages hold only the index, and the index exposes no assessments
  collection, so the domain functions they call had to take the index now. Those are
  `filterFoods(index, filters)`, `filterCategoryEntries(index, filters)`, `catalogueRows(index)`,
  `categoryEntryRows(index)`, `rowsByCategoryId(rows, index)`, and `entryRowsByCategoryId(rows, index)`.
  `categoryEntryRows` now filters `preparationStatesFor` by `assessmentsFor` and no longer sorts the
  vocabulary itself. Category detail finds its axes by filtering those rows.
- The URL helpers only had their array parameters widened to `readonly`. Pages still build a
  category slug set for `parseCatalogueQuery`; ticket 05 removes it.
- Fixtures fixed by adding or correcting records only:
  - Dual-source category assessments in the catalogue and category detail page tests now name
    `nzfs`.
  - In `FoodDetailPage.test.tsx`, "a food eaten in several preparations" added a second
    New Zealand Food Safety food-wide pregnancy rule on farmed salmon beside the authored one,
    which validation rejects as a duplicate. The fixture's rule now replaces the authored
    `farmed-salmon-pregnancy`. Every assertion is unchanged.
- That invalid fixture was the only coverage for a branch in `statusBearingAssessments`
  (`assessment.ts`): it let a same-source qualified assessment govern an unqualified one at the same
  level. Each level sits on one preparation axis, and validation allows one assessment per source
  there, so valid content never reaches the branch. It also disagreed with the architecture
  overview, which says the more cautious status governs when axes combine. The helper is removed,
  and resolution is unchanged for every valid input. `byBreadth` is also a no-op for the same
  reason but has no branch, so it stays for a later tidy-up.
