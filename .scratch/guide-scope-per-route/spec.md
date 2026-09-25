# Read the guide scope once per route

Category: enhancement
Status: needs-triage
Feature: [F-02: Find, filter, and share guide entries](../../docs/features/02-find-filter-and-share-guide-entries.md)
Reported: 2026-09-24
Origin: architecture review of 2026-09-24, candidate 5 (speculative)

> Not yet grilled, and speculative: the deletion test is marginal because each copied step is short.
> Confirm in a deep-dive whether this is worth doing on its own or folds into the content index or
> catalogue view work.

## Problem Statement

Every route reads the URL contract by hand in the same sequence. The catalogue, food detail, and
category detail pages each parse the catalogue query, turn the selected scope slugs into guidance
lists, and rebuild the canonical search string for their return links. The detail pages also read
the opened preparation. The catalogue additionally turns a category slug into a category ID for
filtering.

The steps are short, but the scope rule (which guidance lists a URL selects, and how the return link
preserves it) lives in three pages rather than in the URL-contract module.

## Solution

Extend the URL-contract module in the application layer with one function that, given the URL search
parameters and the content index, returns everything a route needs from the query: the parsed state,
the selected guidance lists, the filter state for the domain, the return search string, the opened
preparation, and whether unavailable filters were removed. Each route calls it once. Readers see no
change.

## User Stories

1. As a maintainer, I want one function to read the guide scope from the URL, so that the scope rule lives in one module.
2. As a maintainer, I want the selected guidance lists produced by that function, so that pages stop filtering lists by slug themselves.
3. As a maintainer, I want the return search string produced by that function, so that every back link preserves the reader's catalogue state identically.
4. As a maintainer, I want the domain filter state produced by that function, so that slug-to-ID conversion does not live in the catalogue page.
5. As a maintainer, I want the opened preparation read by the same function, so that detail pages read the URL through one entry point.
6. As a maintainer, I want the function to live in the application layer, so that the domain stays free of URL knowledge.
7. As a maintainer, I want URL contract tests to cover the new function, so that page tests stop re-testing parsing.
8. As a reader following a shared link, I want scopes, filters, and search restored exactly as today, so that shared URLs keep working.
9. As a reader, I want the back link from a detail page to return me to the catalogue I came from, so that I keep my place.
10. As a reader opening a link with unavailable filters, I want them still removed with the same announcement, so that nothing changes for me.

## Implementation Decisions

- Extend the existing URL-contract module rather than add a new one.
- Proposed interface: search parameters and content index in; parsed state, selected guidance lists, filter state, return search, opened preparation, and the unavailable-filters flag out.
- Open question for the deep-dive: whether this is a plain function or a routing hook, given the one-way import rule keeps router code out of the domain but allows it in the application layer.
- The canonical URL shape and versioning do not change.
- Dependency category: in-process.
- No ADR conflicts.

## Testing Decisions

- A good test passes search parameters and a fixture index and asserts the returned scope, lists, filter state, and return search. It does not render a page.
- Prior art: the existing catalogue query tests.
- Page tests keep one check each that the back link and selected scopes survive navigation.
- Playwright direct-URL and sharing scenarios stay unchanged.

## Out of Scope

- Changing the URL contract, parameter names, or version.
- Adding preparation to the catalogue's canonical URL.

## Further Notes

- Lowest priority of the architecture review specs. Consider folding it into the content index or catalogue view work rather than doing it alone.
