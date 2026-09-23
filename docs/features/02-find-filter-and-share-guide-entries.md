# F-02: Find, filter, and share guide entries

**Status:** Done

**Depends on:** [F-01: Browse the Food Guide](<01-browse-food-guide.md>)

**Governing decisions:** [Client-only React SPA](<../decisions/2026-09-21 ADR - deliver a client-only React SPA.md>), [independent guidance lists and sources](<../decisions/2026-09-21 ADR - model guidance as independent lists and sources.md>), [conservative resolution](<../decisions/2026-09-21 ADR - resolve guidance conservatively without inference.md>), and [local quality gates](<../decisions/2026-09-21 ADR - enforce local quality gates.md>)

## Goal

Let Polly reach relevant foods and assessed categories quickly, understand why each result is
present, and reproduce the same result from its URL.

## Primary experience

1. Search by a food name, alias, or category-path term.
2. Narrow results by category, guidance scope, and generic outcome.
3. See matching rows in their browse hierarchy with an announced result count and active chips.
4. Copy, refresh, or follow a detail link without losing useful catalogue context.

## Required behaviour

- Search names, aliases, and category paths with case-, punctuation-, whitespace-, and
  diacritic-insensitive token matching.
- Keep sequential search editing responsive, including spaces between words, while settling the
  completed query into the shareable URL.
- Include a selected category's complete descendant subtree.
- Default an absent `scope` to pregnancy food safety and vegetarian suitability.
- Combine selected scopes cumulatively; combine selected generic outcomes as alternatives within
  every selected scope.
- Filter and count preparation-qualified rows independently rather than treating a food as one
  indivisible result.
- Count foods and assessed categories as guide entries and announce changes accessibly.
- Expose every active scope and outcome as a labelled chip, with a clear-all action and useful
  no-results state.
- Serialise state with `v=1`, `scope`, `outcome`, `q`, and `category`; carry `prep` only as detail
  navigation context.
- Remove unknown or obsolete shared values while retaining valid values and announce that removal.
- Ignore an unknown detail-only `prep` value, show no highlighted preparation, and omit it from links
  generated from the parsed state; it does not trigger the shared-filter announcement.
- Auto-expand matching rows so a search or filter cannot hide a result behind a disclosure.

## Non-goals

- Server-side search, autocomplete, AI matching, spelling correction, or external search services.
- Saved searches, profiles, favourites, analytics, or browser persistence.
- Filtering or recommendations derived from condition facts.

## Assumptions and open questions

- URL state is sufficient persistence for the current product.
- No open question blocks this implemented capability.

## Acceptance criteria

- Searching an alias or category term reveals the canonical entry in its full category context.
- Category, scope, and outcome filters compose according to the documented AND/OR rules.
- A raw row can match while the same food's cooked row does not, and the result count reflects rows.
- A copied `v=1` URL reproduces the result; unsupported shared values are removed and announced
  without losing valid constraints, while an unsupported `prep` value is safely ignored.
- Search and filter controls remain labelled, keyboard-operable, and usable at 320px.

## Validation

Unit tests cover normalisation, category descendants, row filtering, query parsing, serialisation,
and invalid values. Catalogue component and Chromium Playwright tests cover sequential multi-word
typing, combined filters, announcements, clear-all, no results, direct filtered URLs, and navigation
context under the repository-wide coverage and accessibility gates.
