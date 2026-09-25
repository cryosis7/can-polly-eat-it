# 02: Search-collapse a preparation band

Category: bug
Status: done
Parent: [Honour a collapse made during a search](../spec.md)

**What to build:** While filtering, a reader can collapse and reopen a preparation band for this
filter only, under the same rule ticket 01 gave category rows: no aggregate chip, discarded when the
filter changes, and the browse state (every band collapsed by default) restored when the filters
clear. Band keys come from the domain collapse-state module, and the page no longer builds band key
strings itself.

**Blocked by:** 01.

## Acceptance criteria

- [x] The collapse-state module issues band keys and answers whether a band is collapsed, for both
  browse and search parts; the page builds no band key strings.
- [x] The search part records collapsed bands; bands default to open while filtering.
- [x] While filtering, a search-collapsed band hides its callout and foods, reports
  `aria-expanded="false"`, and shows no aggregate chip.
- [x] Changing any of search text, category, outcomes, or selected scopes reopens every band.
- [x] Clearing the filters restores the browse band state from before the search.
- [x] Browsing behaviour is unchanged: bands default collapsed, and a collapsed band shows its chip.
- [x] Domain tests cover band keys and band collapse through the module's interface; page tests
  cover the rendering above.
- [x] Coverage stays at 100% and every Playwright scenario passes.

## Comments

- 2026-09-25: Implemented and merged into `main` as dbfbd70; every acceptance criterion met, coverage at 100%, and all 79 Playwright scenarios pass.
