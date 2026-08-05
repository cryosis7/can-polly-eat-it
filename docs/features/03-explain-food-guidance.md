# F-03: Explain Food Guidance

**Status:** Done

**Depends on:** [F-01: Browse the Food Guide](<01-browse-food-guide.md>)

**Governing decisions:** [Static TypeScript React SPA](<../decisions/2026-08-04 ADR - use a static TypeScript React SPA.md>), [version-controlled static content](<../decisions/2026-08-04 ADR - store reviewed guide content as version-controlled static data.md>), [canonical reason foods](<../decisions/2026-08-04 ADR - link assessments to canonical reason foods.md>), and [scoped guidance with generic outcome filters](<../decisions/2026-08-06 ADR - show scoped guidance with generic outcome filters.md>)

## Goal

Make an outcome understandable and auditable so Polly can act on the conditions rather than seeing
only a red, amber, or green badge.

## Primary experience

1. Open a food detail from the catalogue.
2. See each independently resolved guidance list's named outcome, short explanation, and source.
3. Read the applicable scenario, including preparation, storage, serving, frequency, or composition.
4. Follow the official source link, and where relevant follow a linked canonical ingredient such as
   Gelatin to understand why the assessed food has that outcome.

## Required behaviour

- Use a stable food slug route and preserve the catalogue's `v=1`, `scope`, `outcome`, `q`, and
  `category` context.
- Render each relevant guidance list independently; do not infer one list's status from another.
- Render each guidance scenario's applicability and complete prose instruction before its ordered
  conditions; do not combine conditions from separate scenarios.
- Present optional display facts such as `75 degC` or `within 2 days` only with their prose
  instruction; do not calculate or generate advice from them.
- Render each authored reason link with its statement and a link to the target food detail. A reason
  link supports the explanation but does not substitute for the assessed food's own citation or
  determine its status.
- Keep reason links off catalogue cards in the first release.
- Resolve absent assessment as either the list's grey "Not assessed" state inside coverage or
  "Outside current coverage" outside it.
- Display a safe not-found page for an unknown or removed food route.
- Include the product's medical-information disclaimer and source links.
- Preserve useful catalogue context when returning to the browse view.

## Non-goals

- Generating recommendations from raw facts.
- Medical triage, portion planning, or automated source summarisation.
- Editing content from the application.

## Assumptions and open questions

- The food-detail route, reason-link navigation, and safe not-found handling are implemented in
  `src/features/food-detail/FoodDetailPage.tsx` and verified by
  `src/features/food-detail/FoodDetailPage.test.tsx` and `e2e/catalogue.spec.ts`.
- No open question blocks this completed slice.

## Acceptance criteria

- A conditional cheese item can show alternative preparation/storage scenarios without suggesting
  that both alternatives apply, and can cite the exact source row.
- A composite food can show "Contains [Gelatin]" on its detail page and navigate to the canonical
  Gelatin detail page; neither status is inferred from the link.
- A direct `/food/<slug>?v=1&scope=<list-slug>` load displays independently resolved guidance,
  including the requested scope, after deployment.
- A user can distinguish "avoid" from "only with conditions" without relying on colour.

## Validation

Tests must retain the repository-wide 100% global statements, branches, functions, and lines
coverage thresholds for application source. Add Chromium Playwright tests that open a direct
food-detail URL, verify independently resolved guidance, scenarios, citation and reason-link
navigation, disclaimer, and safe not-found route.
