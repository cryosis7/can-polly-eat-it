# 01: Search-collapse a category row

Category: bug
Status: done
Parent: [Honour a collapse made during a search](../spec.md)

**What to build:** While a search, category, or outcome filter is active, a reader can collapse and
reopen any category row, root or nested, and it really collapses for this filter only. A
search-collapsed row shows no aggregate chip. Changing the search text, category, outcomes, or
selected scopes reopens every group holding a match. Clearing the filters restores the reader's
browse collapse state exactly as it was before the search. The collapse rule lives in a new domain
collapse-state module: the two-part state (browse, and a search part stamped with the filter it was
made under), its defaults, the stamp comparison, the toggle rule, and whether a category row is
collapsed. The page holds the state and calls the module.

**Blocked by:** None (can start immediately).

## Acceptance criteria

- [x] The domain module owns "is filtering" (search, category, or outcome active; scopes alone are not).
- [x] Browse defaults are unchanged: every root category collapsed.
- [x] The search part defaults to empty and is ignored whenever its stamp differs from the current
  filter state; guidance list and outcome order do not make a stamp stale. No effect resets it; the
  page discards a stale search part during render, so returning to an earlier filter opens every
  row rather than reviving its collapse.
- [x] A toggle while filtering changes only the search part (starting empty if the stamp is stale)
  and stamps it with the current filter; a toggle while browsing changes only the browse part.
- [x] While filtering, a search-collapsed row hides its own guidance and descendants, reports
  `aria-expanded="false"`, and shows no aggregate chip; an open row reports `aria-expanded="true"`.
- [x] Changing any of search text, category, outcomes, or selected scopes while filtering reopens
  every row holding a match.
- [x] Clearing the filters restores the browse collapse state from before the search; a bare scope
  change while browsing still leaves it alone.
- [x] The result count is unchanged by any collapse.
- [x] The module imports no React, router, or browser modules and is tested through its interface.
- [x] Page tests cover the rendering above; the existing "reveals a match inside a collapsed group
  and restores manual expansion when the search clears" test is rewritten where it relied on the
  old behaviour.
- [x] A Chromium Playwright scenario searches `rice`, collapses Drinks, sees its body hidden with
  no chip, clears the search, and finds the browse collapse state as it was before the search.
- [x] F-02's "Auto-expand matching rows" behaviour line is replaced with the search-collapse rule
  and a matching acceptance criterion is added.
- [x] Coverage stays at 100% and every Playwright scenario passes.

## Comments

- 2026-09-25: Implemented and merged into `main` as e8d632f; every acceptance criterion met, coverage at 100%, and all 79 Playwright scenarios pass.
