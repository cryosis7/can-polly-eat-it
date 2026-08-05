# F-02: Search and Filter Foods

**Status:** Done

**Depends on:** [F-01: Browse the Food Guide](<01-browse-food-guide.md>)

**Governing decisions:** [Static TypeScript React SPA](<../decisions/2026-08-04 ADR - use a static TypeScript React SPA.md>), [independent guidance lists](<../decisions/2026-08-04 ADR - use independent guidance lists for food assessments.md>), and [scoped guidance with generic outcome filters](<../decisions/2026-08-06 ADR - show scoped guidance with generic outcome filters.md>)

## Goal

Let Polly find a known food quickly or reduce the guide to a meaningful subset while preserving a
shareable result.

## Primary experience

1. Type a food name, alternate name, or category word.
2. Optionally select a category, dietary scopes, and generic outcomes.
3. See only matching foods, still grouped by their category path.
4. Copy the URL or refresh the page without losing the result.

## Required behaviour

- Search food names, aliases, and category-path labels with case-, punctuation-, and
  diacritic-insensitive matching.
- Include descendants when a category is selected.
- Default an absent scope to pregnancy food safety; allow additional dietary scopes as cumulative
  constraints.
- Allow several generic outcome bands as alternatives within every selected scope.
- Combine selected dietary scopes with category and search predicates cumulatively.
- Support a clear, visible "clear filters" action.
- Use accessible labels, results count announcement, and a useful no-results state.
- Use `v=1`, `scope=<comma-separated-guidance-list-slugs>`, `outcome=<comma-separated-outcome-bands>`,
  `q`, and `category` as the URL contract.
- Show every active filter as a dietary-scope or generic-outcome-labelled chip.
- Validate URL parameters and, if content has changed, default to pregnancy scope, drop only invalid
  constraints, and announce that unavailable shared filters were removed.

## Non-goals

- Server-side autocomplete, fuzzy AI matching, spelling correction, or external search services.
- Saved searches, user profiles, or data collection.
- Filtering, calculations, or recommendations based on condition facts.

## Assumptions and open questions

- URL state remains the shareable product state; no account or browser persistence is required.
- No open question blocks this completed slice. A mobile-first control redesign is a future feature,
  not a change to filtering semantics.

## Acceptance criteria

- Searching an alias finds the canonical food card.
- Selecting `Dairy` includes results under all of its descendants.
- Selecting both "Maybe - see notes" and "Not okay" returns either outcome in every selected scope;
  adding vegetarian suitability requires both selected scopes to match.
- A copied `v=1` filtered URL reproduces the same result in a fresh session, while unknown scopes
  or outcomes fall back safely and visibly.

## Validation

Tests retain the repository-wide 100% global statements, branches, functions, and lines coverage
thresholds for application source. Chromium Playwright tests exercise alias search, category,
scope/outcome filtering, clearing active filters, and direct loading of a versioned filtered URL.
