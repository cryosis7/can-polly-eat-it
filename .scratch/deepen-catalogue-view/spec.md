# Deepen the catalogue view

Category: enhancement
Status: needs-triage
Feature: [F-01: Browse the food guide](../../docs/features/01-browse-food-guide.md), [F-02: Find, filter, and share guide entries](../../docs/features/02-find-filter-and-share-guide-entries.md)
Reported: 2026-09-24
Origin: architecture review of 2026-09-24, candidate 1 (top recommendation)

> Not yet grilled. The seam, interface shape, and test migration below are proposals to confirm in
> a deep-dive before this moves to `ready-for-agent`.

## Problem Statement

The catalogue page is the most-changed module in the repository, and every change to how the
catalogue is derived has to be made inside a React page. To work out what the catalogue shows for a
query, a maintainer must read the page and follow it through about twelve domain exports called in a
fixed order: row filtering for foods and guide entries, dropping entries already stated by a
descendant preparation grouping, preparation ordering, grouping rows by category and preparation,
retaining ancestor headings, hiding collapsed rows, resolving guidance per row and guidance list,
folding outcomes per category and subtree, choosing the governing rule for each preparation
grouping, and summarising collapsed-row chips.

The domain modules involved are shallow: each exposes an interface almost as wide as its
implementation, and the knowledge that ties them together (the order, the outcome fold, and the
invariant that a collapsed-row chip never summarises a filtered subset) lives only in the page. That
invariant is currently "asserted structurally" by a comment and checked only through rendered DOM
tests. The page's 59 tests exercise derivation through the DOM because there is no seam beneath the
page to test it at.

## Solution

Introduce one deep domain module, the **catalogue view**, that takes the content index and the
current filter state and returns everything the catalogue renders: category sections in editorial
order with breadcrumbs and depth, each section's own guide entry, its preparation groupings with
their governing rules, the foods in each grouping with their resolved guidance per selected guidance
list, per-section and per-grouping entry counts, the pre-folded collapsed-row chip outcomes, and the
result count.

The catalogue page keeps only what is genuinely UI: URL synchronisation, the search control, filter
controls, collapse and expansion state, and rendering the view. Readers see no change.

## User Stories

1. As a maintainer, I want one module that answers "what does the catalogue show for this query", so that I can change catalogue behaviour without reading a 650-line page.
2. As a maintainer, I want the order in which rows are filtered, surfaced, grouped, and ordered to live inside one module, so that I cannot call the steps in the wrong order.
3. As a maintainer, I want the outcome fold for collapsed-row chips computed inside the catalogue view, so that the fold's deepest-first, iterative walk lives beside the tree it walks.
4. As a maintainer, I want the rule that a collapsed-row chip never summarises a filtered subset to be enforced and tested at the catalogue view's interface, so that it no longer depends on a comment and DOM tests.
5. As a maintainer, I want the governing rule for each preparation grouping resolved inside the catalogue view, so that the page does not resolve guidance itself.
6. As a maintainer, I want the result count produced by the same module that decides which entries appear, so that the count and the rendered rows cannot drift apart.
7. As a maintainer, I want guide entries already stated by a descendant preparation grouping to be dropped inside the catalogue view, so that the catalogue and its count drop them together.
8. As a maintainer, I want derivation tests to assert the returned view rather than rendered markup, so that a markup change does not break a derivation test and a derivation bug is not hidden behind markup.
9. As a maintainer, I want the page tests to shrink to rendering, interaction, URL, and accessibility behaviour, so that each test has one reason to fail.
10. As a maintainer, I want the domain helpers that only served the page removed from the tree module's public interface, so that other callers do not rely on intermediate shapes.
11. As a maintainer adding a new guidance list, I want the catalogue view to handle any number of selected lists without page changes, so that a new list needs data only.
12. As a maintainer adding a new preparation state, I want preparation grouping order to come from the vocabulary inside the catalogue view, so that the page needs no change.
13. As a maintainer, I want the catalogue view to keep working at the content budget of 2,000 foods and 500 categories without recursion, so that the tree still has no depth limit.
14. As a maintainer, I want the catalogue view to import no React, router, or browser modules, so that it respects the one-way import rule.
15. As a reader, I want the catalogue to show exactly the same sections, groupings, guidance, chips, counts, and links after this change, so that the refactor is invisible to me.
16. As a reader, I want a search or filter to still expand any group holding a match, so that no match is hidden behind a collapsed row.
17. As a reader, I want a bare scope change to still leave my collapse state alone, so that switching guidance lists does not reshuffle the page.
18. As a reader using a screen reader, I want every collapsed-row and preparation-grouping label to still name its outcome and entry count, so that the chip's meaning still reaches me.
19. As a reader, I want the root groups to remain chip-free, so that a summary spanning too much of the catalogue never appears.
20. As a product owner, I want the "never infer safety" and "not-assessed is neutral" rules to be testable directly on the catalogue view, so that I can trust future catalogue changes.

## Implementation Decisions

- A new catalogue view module lives in the domain layer and is the only catalogue-derivation entry point the page calls.
- Interface: content index, filter state, and the reader's collapse state (collapsed category IDs and expanded preparation groupings) in; one catalogue view out. The page still holds and toggles collapse state; the view only reads it.
- The view applies the auto-expansion rules (an active search or filter expands every group holding a match; a bare scope change leaves collapse state alone) and returns only the sections to render, each marked collapsed or expanded, with a collapsed-row chip only where collapsed. This puts the "a chip never summarises a filtered subset" invariant behind the interface.
- The view's shape is a nested structure: sections, each with an optional own guide entry, ordered preparation groupings, and entries. Each entry and each preparation grouping's governing rule carries its resolved guidance per selected guidance list, so the page never calls resolution. The view also decides which governing rules exist for a grouping.
- The filter input is the domain filter state (search query, category ID, guidance list IDs, outcome bands), not the URL query state, because the domain must not import the application layer. The view derives "is filtering" from it.
- The page calls the view once per render; a collapse toggle rebuilds the whole view. There is no separate query-result stage in the interface. Toggle cost is measured against a content-budget fixture during implementation, and any caching is added inside the view only if that measurement warrants it.
- The existing row filters, surfacing, grouping, ancestor, visibility, and outcome-fold helpers become the module's internal implementation. Those that no other caller uses leave the public interface.
- Resolution and cross-list outcome combination keep their current behaviour and live where they are; the catalogue view calls them.
- Dependency category: in-process. No adapter or port is needed.
- Depends in practice on the content index becoming the single handle on content (separate spec), which keeps this interface to two parameters. Can also consume the subject-guidance module (separate spec) for preparation-grouping governing rules.
- No ADR conflicts: this reinforces the accepted rule that domain logic stays out of React.

## Testing Decisions

- A good test drives the catalogue view through its interface with a small content fixture and asserts the returned view: which sections, groupings, and entries exist, in what order, with which resolved statuses, counts, and chip outcomes. It does not assert helper calls or intermediate row shapes.
- The collapsed-row chip invariant, preparation-grouping surfacing, per-row outcome filtering, and result-count behaviour move from DOM tests to catalogue view tests.
- Catalogue page tests keep interaction, URL canonicalisation, collapse behaviour, accessible names, live-region announcements, and a small number of end-to-end rendering checks.
- Prior art: the existing domain tests for filtering, the category tree, and collapsed-row summaries, and the multi-source fixture used across domain and page tests.
- Playwright catalogue scenarios stay unchanged and must pass unmodified, as the proof that readers see no difference.
- Coverage stays at 100% for application source.

## Out of Scope

- Any visible change to the catalogue.
- Changing resolution rules, outcome combination rules, or chip semantics.
- Detail pages, except where they share a helper that moves.
- Performance work beyond preserving current memoisation.

## Further Notes

- Evidence: the page's derivation block and per-grouping decisions, and the 59 tests in the catalogue page test file, many of which assert derivation through markup.
- Suggested order across the architecture review specs: content index first, then this spec and the subject-guidance spec.

## Comments

### 2026-09-24 - Deep-dive

- Decided: the view takes collapse state as input and returns only rendered sections with chips on collapsed ones (option A), so the auto-expansion rules and the chip invariant are testable at the interface.
- Decided: every returned entry and governing rule carries resolved guidance per selected list; the page never calls resolution (option A).
- Constraint noted: filter input is domain filter state (IDs), per the one-way import rule.
- Decided: one call per render, collapse toggles rebuild the view; measure at content budget and cache internally only if needed (option A).
