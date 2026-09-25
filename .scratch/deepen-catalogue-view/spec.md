# Deepen the catalogue listing

Category: enhancement
Status: ready-for-agent
Feature: [F-01: Browse the food guide](../../docs/features/01-browse-food-guide.md), [F-02: Find, filter, and share guide entries](../../docs/features/02-find-filter-and-share-guide-entries.md)
Reported: 2026-09-24
Origin: architecture review of 2026-09-24, candidate 1 (top recommendation)
Blocked by: [Honour a collapse made during a search](../search-collapse/spec.md)

## Problem Statement

The catalogue page is the most-changed module in the repository, and every change to how the
catalogue is derived has to be made inside a React page. To work out what the catalogue shows for a
query, a maintainer must read the page and follow it through about twelve domain exports called in a
fixed order: row filtering for foods and guide entries, dropping entries already stated by a
descendant preparation band, preparation ordering, grouping rows by category and preparation,
retaining ancestor headings, hiding collapsed rows, resolving guidance per row and guidance list,
folding outcomes per category and subtree, choosing each preparation band's governing rules, and
summarising aggregate chips.

The domain modules involved are shallow: each exposes an interface almost as wide as its
implementation, and the knowledge that ties them together (the order, the outcome fold, and the
invariant that an aggregate chip never summarises a filtered subset) lives only in the page. The
page's 59 tests exercise derivation through the DOM because there is no seam beneath the page to
test it at.

## Solution

Introduce one deep domain module, the **catalogue listing**, that takes the content index, the
current filter state, and the reader's collapse state, and returns everything the catalogue renders:
category sections in editorial order with breadcrumbs and depth, each section's own guide entry, its
foods declaring no preparation, its preparation bands with their governing rules, the foods in each
band with their resolved guidance per selected guidance list, per-section and per-band counts, the
pre-folded aggregate chip outcomes, whether the listing is filtering, and the result count.

The catalogue page keeps only what is genuinely UI: URL synchronisation, the search control, filter
controls, holding and toggling collapse state, and rendering the listing. Readers see no change from
the behaviour in place once the [search-collapse fix](../search-collapse/spec.md) has merged.

## User Stories

1. As a maintainer, I want one module that answers "what does the catalogue list for this query", so that I can change catalogue behaviour without reading a 650-line page.
2. As a maintainer, I want the order in which rows are filtered, surfaced, grouped, and ordered to live inside one module, so that I cannot call the steps in the wrong order.
3. As a maintainer, I want the outcome fold for aggregate chips computed inside the catalogue listing, so that the fold's deepest-first, iterative walk lives beside the tree it walks.
4. As a maintainer, I want the rule that an aggregate chip never summarises a filtered subset enforced and tested at the catalogue listing's interface, so that it no longer depends on a comment and DOM tests.
5. As a maintainer, I want each preparation band's governing rules resolved inside the catalogue listing, so that the page does not resolve guidance itself.
6. As a maintainer, I want the result count produced by the same module that decides which entries appear, so that the count and the rendered rows cannot drift apart.
7. As a maintainer, I want guide entries already stated by a descendant preparation band dropped inside the catalogue listing, so that the catalogue and its count drop them together.
8. As a maintainer, I want derivation tests to assert the returned listing rather than rendered markup, so that a markup change does not break a derivation test and a derivation bug is not hidden behind markup.
9. As a maintainer, I want the page tests to shrink to rendering, interaction, URL, and accessibility behaviour, so that each test has one reason to fail.
10. As a maintainer, I want the tree helpers that only served the page removed from the tree module's public interface, so that other callers do not rely on intermediate shapes.
11. As a maintainer adding a new guidance list, I want the catalogue listing to handle any number of selected lists, in the index's list order, without page changes, so that a new list needs data only.
12. As a maintainer adding a new preparation state, I want band order to come from the vocabulary inside the catalogue listing, so that the page needs no change.
13. As a maintainer, I want the catalogue listing to keep working at the content budget of 2,000 foods and 500 categories without recursion, so that the tree still has no depth limit.
14. As a maintainer, I want the catalogue listing to import no React, router, or browser modules, so that it respects the one-way import rule.
15. As a reader, I want the catalogue to show exactly the same sections, bands, guidance, chips, counts, and links after this change, so that the refactor is invisible to me.
16. As a reader, I want a search or filter to still open every group holding a match unless I search-collapse it, so that no match is hidden from me.
17. As a reader, I want a bare scope change to still leave my browse collapse state alone, so that switching guidance lists does not reshuffle the page.
18. As a reader using a screen reader, I want every row and band label to still name its outcome and its entry or match count, so that the chip's meaning still reaches me.
19. As a reader, I want root groups to remain chip-free, so that a summary spanning too much of the catalogue never appears.
20. As a product owner, I want the "never infer safety" and "not-assessed is neutral" rules to be testable directly on the catalogue listing, so that I can trust future catalogue changes.

## Implementation Decisions

- A new domain module, the catalogue listing (`src/domain/catalogueListing.ts`), exposes
  `listCatalogue(index, filters, collapse)` and is the only catalogue-derivation entry point the
  page calls. It imports no React, router, or browser modules.
- `filters` is the domain filter state (search query, category ID, guidance list IDs, outcome
  bands), not URL query state. `collapse` is the collapse state from the search-collapse fix's
  domain module, which keeps owning its type, `initialCollapseState(index)`, the toggle rule, and
  band keys; the listing applies its "is this row or band collapsed" rule internally.
- The listing derives whether it is filtering (search, category, or outcome active; scopes alone
  are not) and returns it as one top-level `filtering` flag. The page uses it only to choose
  "entry" or "match" wording; counts stay plain numbers.
- The listing takes guidance list IDs as a set and returns the selected lists, and every per-list
  resolution, in the content index's guidance-list order.
- Returned shape, flat depth-first sections holding domain values only (a sketch; names may be
  refined):

  ```ts
  type CatalogueListing = {
    resultCount: number
    filtering: boolean
    guidanceLists: GuidanceList[]        // selected, in index order
    sections: Section[]                  // flat, depth-first, editorial order
  }
  type Section = {
    category: Category; breadcrumb: string; depth: number
    collapsed: boolean
    entryCount: number                   // entries, or matches while filtering, in the subtree
    chip?: CombinedOutcome               // only if collapsed, not filtering, and depth > 0
    ownEntry?: ListedGuidance            // unqualified category entry; omitted when collapsed
    unpreparedFoods: ListedFood[]        // foods declaring no preparation; [] when collapsed
    bands: Band[]                        // vocabulary order; [] when collapsed
  }
  type Band = {
    key: string; preparation: Preparation; collapsed: boolean
    entryCount: number; chip?: CombinedOutcome
    governingRules: { guidanceList: GuidanceList; resolved: ResolvedAssessment }[]
    hasOwnEntry: boolean                 // the category's own qualified entry; drives its link
    foods: ListedFood[]                  // [] when collapsed
  }
  type ListedFood = { food: Food; resolved: { guidanceList: GuidanceList; resolved: ResolvedAssessment }[] }
  ```

- Sections are flat, not a recursive tree, because rendering a tree needs recursive components and
  would reintroduce a depth limit.
- The page keeps accessible names, "level N" text, count wording, hrefs (which need the return
  search), and indentation. The listing returns no presentation strings.
- Governing rules exist only for lists where an assessment was found, as today. The listing
  computes them itself; the [subject guidance](../subject-guidance-axes/spec.md) module may later
  replace that internally without changing this interface.
- The content index gains a precomputed, query-independent **category outline**: every category
  in editorial depth-first order with breadcrumb and depth. The listing and the category filter
  control both read it, so the tree is not flattened again on each rebuild.
- The arranging and surfacing tree helpers (`flattenCategoryRows`, `visibleCategoryRows`,
  `withAncestorIds`, `entriesSurfacedByDescendants`, `rowsByCategoryId`, `entryRowsByCategoryId`,
  and their group types) become internal. `filterFoods` and `filterCategoryEntries` stay public,
  because "which rows match" is a question in its own right and content tests ask it directly.
  `catalogueRows` and `categoryEntryRows` stay public while other callers use them.
- Resolution and cross-list outcome combination keep their current behaviour and location; the
  listing calls them.
- The page calls the listing once per render; a collapse toggle rebuilds the whole listing. Measure
  a toggle rebuild once against a throwaway fixture of 2,000 foods and 500 categories. Add a cache
  inside the module (for example, reusing the last filtered rows for the same index and filter
  state) only if a rebuild exceeds 50 ms, and record the measurement in the ticket rather than as a
  permanent timing test.
- Dependency category: in-process. No adapter or port.
- Docs: add the catalogue listing to the architecture overview's logical-architecture diagram and
  the `domain/` line of its target project layout. No ADR: the seam is cheap to reverse and only
  reinforces the accepted rule that domain logic stays out of React.

## Testing Decisions

- A good test drives the catalogue listing through its interface with a small content fixture and
  asserts the returned listing: which sections, bands, and entries exist, in what order, with which
  resolved statuses, counts, governing rules, and chip outcomes. It does not assert helper calls or
  intermediate row shapes.
- Split the 59 catalogue page tests by one rule. A test moves to the listing's tests if it asserts
  which sections, bands, entries, counts, or chip outcomes exist. It stays a page test if it asserts
  markup, an accessible name, a URL or link, focus, or interaction. A test doing both is split: the
  derivation goes to the listing and the page keeps one rendering assertion. For example, "drops a
  parent band whose rule its descendants already state", "shows orange juice once", "never chips a
  root category", and "lets a second scope change the summary" move; "keeps every typed character
  while settling a multi-word search" and "hides the chip from assistive technology" stay; "calls
  out the governing rule on the band and names the scope it was authored at" splits.
- Tests of the tree helpers that become internal are rewritten at the listing's interface and the
  helper-level tests deleted. Filtering tests stay.
- Page-level ordering tests for guidance lists move to the listing where they assert order, keeping
  one rendering check.
- Prior art: the existing domain tests for filtering, the category tree, and collapsed-row
  summaries; the multi-source fixture; and the search-collapse fix's collapse-state tests.
- Playwright catalogue scenarios, as they stand after the search-collapse fix, pass unmodified as
  the proof that readers see no difference.
- Coverage stays at 100% for application source.

## Out of Scope

- Any visible change to the catalogue beyond the search-collapse fix it depends on.
- Changing resolution rules, outcome combination rules, chip semantics, or the collapse rule.
- Detail pages, except where they share a helper that moves.
- Performance work beyond the one toggle-rebuild measurement and any cache it justifies.

## Further Notes

- Evidence: the page's derivation block and per-band decisions, and the 59 tests in the catalogue
  page test file, many of which assert derivation through markup.
- The content index spec it depended on has merged (`e9823fa`).

## Comments

### 2026-09-24 - Deep-dive

- Decided: the view takes collapse state as input and returns only rendered sections with chips on collapsed ones (option A), so the auto-expansion rules and the chip invariant are testable at the interface.
- Decided: every returned entry and governing rule carries resolved guidance per selected list; the page never calls resolution (option A).
- Constraint noted: filter input is domain filter state (IDs), per the one-way import rule.
- Decided: one call per render, collapse toggles rebuild the view; measure at content budget and cache internally only if needed (option A).

### 2026-09-25 - Grilling

- Decided: the module is the **catalogue listing** (`src/domain/catalogueListing.ts`), because the architecture overview already uses "view" for every rendered surface.
- Decided glossary: **preparation band** (not "preparation grouping"), **aggregate chip** (not "collapsed-row chip"), **governing rule** for a band's resolved per-scope rule and **callout** for its rendering. Recorded in the architecture overview.
- Decided: fix the toggle-under-filter bug first, as its own change with the Playwright scenario adjusted to assert the new behaviour, then do this refactor. Found: while filtering, a toggle flips the stored collapse state but the row stays forced open, so the click does nothing visible and surfaces after the filter clears.
- Decided: keep the one-call design; reword Out of Scope; measure a toggle rebuild once against a throwaway 2,000-food, 500-category fixture, caching internally only above 50 ms; record the result in the ticket.
- Decided: the content index exposes a precomputed, query-independent category outline (breadcrumb, depth, editorial order) read by both the listing and the category filter; `flattenCategoryRows` becomes internal.
- Decided: the domain owns `CollapseState`, `initialCollapseState(index)`, and opaque band keys returned on each band.
- Decided: flat depth-first sections returning domain values only; `unpreparedFoods` is its own field; accessible names, hrefs, and indentation stay in the page.
- Decided: the listing computes governing rules itself behind its interface; subject guidance may later replace that internally.
- Decided: `filterFoods` and `filterCategoryEntries` stay public; the arrangement and surfacing tree helpers become internal and their tests move to the listing interface.
- Decided (toggle bug, option A): while filtering, a toggle performs a **search collapse** for this filter only, with no chip; clearing the filters restores the browse collapse state.
- Decided: a search collapse is discarded on any change to search, category, outcomes, or selected scopes while filtering.
- Decided: search collapses are stamped with the filter they were made under and ignored when it no longer matches, rather than reset by an effect.
- Decided (mockup option B): while filtering, every category row and preparation band, open or collapsed and roots included, shows "N match(es)" instead of "N entries", in visible text and accessible name. Rejected: a whole-group "entries" count (misread as the group size), no count (bands inconsistent), "N of M" (needs unfiltered totals, reads as "1 of 1").
- Glossary: **match** and **search collapse** recorded in the architecture overview.
- Decided: the search-collapse fix is its own bug spec (`.scratch/search-collapse/spec.md`), which blocks this one; it owns the collapse-state domain module this listing consumes.
- Decided: split the page tests by one rule: derivation moves to the listing, rendering stays, mixed tests split with one rendering check kept.
- Decided: the listing returns selected guidance lists and every per-list resolution in the index's guidance-list order, whatever the input order.
- Decided: the listing returns one top-level `filtering` flag; the page chooses "entry" or "match" wording.
- Decided: docs update the overview's logical-architecture diagram and project layout only; no ADR.
- Spec rewritten to these decisions and set to `ready-for-agent`.
