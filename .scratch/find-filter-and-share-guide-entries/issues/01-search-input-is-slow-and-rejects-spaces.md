# Search input is slow and rejects spaces

Status: ready-for-agent
Resolution: implemented
Feature: [F-02: Find, filter, and share guide entries](../../../docs/features/02-find-filter-and-share-guide-entries.md)
Reported: 2026-09-21

## Problem

Typing into **Search foods** feels slow and does not support normal multi-word entry. Once a user
has entered the first word, pressing Space is discarded, so subsequent text cannot be entered as a
second search token.

This breaks F-02's required whitespace-insensitive token matching even though an equivalent
multi-word query loaded directly from the URL works.

## Reproduction

Tested in local Chromium against commit `ffcb7d2` with the current 242-result catalogue:

1. Open `/` and wait for the catalogue to load.
2. Enter `farmed` in **Search foods**.
3. Press Space.
4. Type `salmon`.

### Actual

- After step 2, the field contains `farmed` and the URL contains `q=farmed`.
- After step 3, the field still contains `farmed`; the trailing space is removed.
- After step 4, the field and URL still contain only `farmed`.
- The input feels sluggish while the catalogue is recalculated.

The deterministic browser repro was:

```ts
await search.fill('farmed')
await search.press('Space')
await search.pressSequentially('salmon', { delay: 100 })
```

It finished with `{ value: "farmed", q: "farmed" }`. By comparison, directly opening
`/?v=1&scope=pregnancy-food-safety&q=farmed%20salmon` retains `farmed salmon` and shows three
matching guide results.

## Relevant implementation

- The search box is controlled by the query parsed from the URL.
- Every input change immediately writes a new URL.
- Query parsing trims the URL value, so a trailing space cannot survive long enough for the next
  word to be entered.
- The catalogue creates its content index, category rows, lookup maps, filtered rows, resolved
  guidance, and rendered hierarchy during render, so each URL-backed keystroke repeats substantial
  synchronous work.

These observations identify the path to investigate, not a required implementation. Preserve the
client-only architecture and the existing shareable URL contract.

## Expected behaviour

- The search field accepts ordinary sequential typing, including spaces between words.
- Input echo remains immediate while result calculation and URL synchronisation happen without
  dropping or rewriting characters.
- A settled multi-word query still uses the documented normalisation and token matching and remains
  reproducible from `q` in the URL.
- Search remains responsive as the authored catalogue grows.

## Acceptance criteria

- Sequentially typing `farmed salmon` leaves exactly `farmed salmon` in the search field.
- Once the search settles, the URL contains the complete query and the existing three matching
  guide results are shown.
- Leading, trailing, and repeated whitespace may be canonicalised only after it no longer interferes
  with editing; spaces between query tokens are retained.
- Typing, pasting, deleting, and clearing a query do not lose characters or focus.
- Static catalogue indexes and other query-independent derived data are not rebuilt for every
  search input event.
- Result filtering does not block immediate input feedback; capture a browser timing baseline before
  the fix and record the before/after result in the implementation notes.
- Existing direct-URL, alias, punctuation, case, diacritic, filter, result-count, and accessibility
  behaviour remains unchanged.

## Validation

- Add a Chromium Playwright regression that uses sequential typing rather than `fill()` and asserts
  the field value, URL query, and matching result.
- Add focused component or domain coverage for any new draft-query, scheduling, or memoisation
  behaviour.
- Run the narrow catalogue component and Playwright tests during implementation, then the repository
  quality gates before merge.

## Comments

### 2026-09-21 - Implemented

- The input now owns its immediate draft text and settles a trimmed query after 250 ms or on form
  submission. URL navigation and filter-chip changes still synchronise back into the field.
- The content index, category rows, slug lookup, preparation lookup, and preparation ordering are
  memoised from their authored content dependencies. Draft keystrokes render only the search
  control; catalogue filtering runs once the query settles.
- Before the fix, the deterministic 100 ms-per-key browser repro took 2,620 ms including a 500 ms
  settling wait and finished with an empty field and no query. The equivalent post-fix run took
  2,875 ms in local dev tooling and finished with `farmed salmon`, `q=farmed%20salmon`, and three
  results. The wall-clock samples include 1,800 ms of deliberate typing/wait time and dev-tool
  overhead; the behavioural performance guarantee is that each key updates isolated draft state
  rather than synchronously rebuilding and rendering the catalogue.
- Focused component tests, all 40 catalogue Playwright scenarios, lint, type-check, and the
  production build passed. The full Vitest suite passed all 278 tests at 100% statements, branches,
  functions, and lines with a 15-second diagnostic timeout; under coverage instrumentation, varying
  existing render-heavy tests exceeded the default 5-second per-test timeout without assertion
  failures. The required prepare review finished with 0 blockers and 0 should-fix findings.
