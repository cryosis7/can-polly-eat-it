# 04: Retire page-only tree helpers and measure a toggle rebuild

Category: enhancement
Status: ready-for-agent
Parent: [Deepen the catalogue listing](../spec.md)

**What to build:** The contract step. The tree helpers that only served the page's derivation (tree
flattening, visibility, ancestor retention, descendant surfacing, and grouping rows by category and
preparation, with their group types) become internal to the listing, and their helper-level tests
are replaced by listing tests. Row filtering stays public. A collapse toggle rebuild is measured once
at the content budget, and caching is added inside the listing only if the measurement warrants it.
The architecture overview shows the catalogue listing.

**Blocked by:** 03.

## Acceptance criteria

- [ ] No module outside the listing imports the retired helpers; they are no longer exported.
- [ ] `filterFoods` and `filterCategoryEntries` remain public and their tests are unchanged.
- [ ] Helper-level tests for retired helpers are deleted once their behaviour is covered at the
  listing interface; coverage stays at 100%.
- [ ] A toggle rebuild is measured once in dev against a throwaway fixture of 2,000 foods and 500
  categories; the result is recorded in this ticket's comments, and no permanent timing test is added.
- [ ] If a rebuild exceeds 50 ms, a cache inside the listing (for example reusing the last filtered
  rows for the same index and filter state) brings it under, with the page unchanged; otherwise no
  cache is added.
- [ ] The architecture overview's logical-architecture diagram and the `domain/` line of its target
  project layout name the catalogue listing.
- [ ] Every Playwright scenario passes unmodified.
