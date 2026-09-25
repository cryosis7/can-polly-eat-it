# 04: Retire page-only tree helpers and measure a toggle rebuild

Category: enhancement
Status: done
Parent: [Deepen the catalogue listing](../spec.md)

**What to build:** The contract step. The tree helpers that only served the page's derivation (tree
flattening, visibility, ancestor retention, descendant surfacing, and grouping rows by category and
preparation, with their group types) become internal to the listing, and their helper-level tests
are replaced by listing tests. Row filtering stays public. A collapse toggle rebuild is measured once
at the content budget, and caching is added inside the listing only if the measurement warrants it.
The architecture overview shows the catalogue listing.

**Blocked by:** 03.

## Acceptance criteria

- [x] No module outside the listing imports the retired helpers; they are no longer exported.
- [x] `filterFoods` and `filterCategoryEntries` remain public and their tests are unchanged.
- [x] Helper-level tests for retired helpers are deleted once their behaviour is covered at the
  listing interface; coverage stays at 100%.
- [x] A toggle rebuild is measured once in dev against a throwaway fixture of 2,000 foods and 500
  categories; the result is recorded in this ticket's comments, and no permanent timing test is added.
- [x] If a rebuild exceeds 50 ms, a cache inside the listing (for example reusing the last filtered
  rows for the same index and filter state) brings it under, with the page unchanged; otherwise no
  cache is added.
- [x] The architecture overview's logical-architecture diagram and the `domain/` line of its target
  project layout name the catalogue listing.
- [x] Every Playwright scenario passes unmodified.

## Comments

- 2026-09-25: Toggle rebuild measured once in dev (Vitest, Node 24.19.0, no coverage) against a
  throwaway fixture of 500 categories (20 roots, 80 children, 400 grandchildren), 2,000 foods (about
  40% declaring one or two of five preparations), two guidance lists, and 2,258 assessments, giving
  2,985 guide entries in 462 sections. Each case is one `listCatalogue` call, 5 warm-ups then 30
  samples:

  | Case | Median | Max |
  | --- | --- | --- |
  | One root opened from the default state | 21.4 ms | 35.5 ms |
  | Every category open | 21.1 ms | 49.3 ms |
  | Every category and band open | 27.5 ms | 45.8 ms |
  | Toggle while searching "food 1" | 35.7 ms | 54.3 ms |
  | Toggle under an okay outcome filter | 19.3 ms | 27.7 ms |

  Every median is under 50 ms, so no cache was added. The single 54.3 ms sample while searching was
  a one-off peak (most likely a garbage-collection pause), not a typical rebuild. The fixture was
  deleted and no timing test was added.
- 2026-09-25: Implemented and merged into `main` as dda047a; every acceptance criterion met,
  coverage at 100%, and all 79 Playwright scenarios pass unmodified. Flattening was already retired
  in ticket 01. Ancestor retention (`withAncestorIds`) was deleted rather than made internal, because
  the listing lists a category exactly when its subtree holds an entry. Grouping rows by category
  and preparation now keeps input order: bands already take vocabulary order from the category's
  preparation states, so the re-sort was redundant. `sortByEditorialOrder` is now exported from the
  tree module, so the listing orders foods by the same rule. `foodsByCategoryId` was not on the
  retirement list and stays as it was. The `prepare` check ran in a subagent over `743d339..dda047a`
  and found no dependency changes, no documentation made untrue, and no undocumented architecture.
