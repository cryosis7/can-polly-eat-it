# F-01: Browse the food guide

**Status:** Done

**Depends on:** None

**Governing decisions:** [Client-only React SPA](<../decisions/2026-09-21 ADR - deliver a client-only React SPA.md>), [catalogue subjects and preparation](<../decisions/2026-09-21 ADR - model catalogue subjects and preparation independently.md>), [independent guidance lists and sources](<../decisions/2026-09-21 ADR - model guidance as independent lists and sources.md>), [conservative resolution](<../decisions/2026-09-21 ADR - resolve guidance conservatively without inference.md>), and [local quality gates](<../decisions/2026-09-21 ADR - enforce local quality gates.md>)

## Goal

Let Polly browse foods and assessed categories in familiar groups, see preparation context, and spot
which collapsed areas need attention.

## Primary experience

1. Open the home page with pregnancy food safety and vegetarian suitability selected.
2. Browse the category hierarchy in editorial order.
3. Expand a category or preparation band to see its complete guidance and entries.
4. Use the aggregate chip to decide whether a hidden group needs attention.
5. Follow a food or assessed-category entry to [F-03](<03-understand-reviewed-guidance.md>).

## Required behaviour

- Render an arbitrary-depth category tree through flattened rows, complete breadcrumbs, and
  depth-safe indentation.
- Keep each food filed once under what it is, then group its rows by the preparation states people
  actually eat it in.
- Treat an assessed category as a guide entry with its own route, status, and guidance.
- Let users collapse nested categories and preparation bands without hiding the fact that their
  contents are uniform, mixed, or need attention.
- Never show an aggregate chip beside the guidance it summarises or while a content-narrowing filter
  is active.
- Show every selected list's status and guidance with text and icons as well as colour.
- Preserve editorial category, preparation, and food order.
- Keep all disclosure controls keyboard-operable and the catalogue usable at 320px and desktop
  widths.
- Do not silently truncate the catalogue within its 2,000-food and 500-category budget.

## Non-goals

- Search, filters, and shareable query state, which belong to [F-02](<02-find-filter-and-share-guide-entries.md>).
- Detailed explanation and provenance, which belong to [F-03](<03-understand-reviewed-guidance.md>).
- Content editing in the browser.
- Personalised advice or saved favourites.

## Assumptions and open questions

- The list vocabulary and status labels are authored content, not UI constants.
- No open question blocks this implemented capability.

## Acceptance criteria

- A 1,000-level domain tree can be flattened without a stack overflow, while readable UI fixtures
  expose complete breadcrumbs.
- A category with direct foods, descendants, assessed guidance, and preparation bands renders every
  entry in stable editorial order.
- Collapsing a nested row hides its body and shows a colour-independent aggregate summary; expanding
  it restores every authored guidance layer.
- A keyboard and screen-reader user can operate the hierarchy and hear labels, states, breadcrumbs,
  and status meaning.

## Validation

Domain and component tests cover tree derivation, preparation bands, disclosure state, and
aggregate summaries. Chromium Playwright covers mobile and desktop browsing, keyboard-operable
disclosures, breadcrumbs, status meaning, and assessed-category and food links. All tests retain the
repository-wide coverage and accessibility gates.
