# Feature 02: Search and Filter Foods

## Goal

Let Polly find a known food quickly or reduce the guide to a meaningful subset while preserving a
shareable result.

## Primary experience

1. Type a food name, alternate name, or category word.
2. Optionally select a category and status outcomes from one or more guidance lists.
3. See only matching foods, still grouped by their category path.
4. Copy the URL or refresh the page without losing the result.

## Required behaviour

- Search food names, aliases, and category-path labels with case-, punctuation-, and
  diacritic-insensitive matching.
- Include descendants when a category is selected.
- Allow several statuses in one selected list as alternatives.
- Combine different filter dimensions cumulatively.
- Support a clear, visible "clear filters" action.
- Use accessible labels, results count announcement, and a useful no-results state.
- Use `v=1`, `list=<display-list-slug>`, `q`, `category`, and
  `status.<list-slug>=<comma-separated-status-slugs>` as the URL contract.
- Show every active filter as a list-labelled chip; the display list must remain distinct from a
  list used only as a constraint.
- Validate URL parameters and, if content has changed, select the default list, drop only invalid
  constraints, and announce that unavailable shared filters were removed.

## Not in this feature

- Server-side autocomplete, fuzzy AI matching, spelling correction, or external search services.
- Saved searches, user profiles, or data collection.
- Filtering, calculations, or recommendations based on condition facts.

## Test confidence

Tests for this feature must retain the repository-wide 100% global statements, branches, functions,
and lines coverage thresholds for application source.

Chromium Playwright tests must exercise alias search, category and status filtering, clearing active
filters, and direct loading of a versioned filtered URL.

## Acceptance examples

- Searching an alias finds the canonical food card.
- Selecting `Dairy` includes results under all of its descendants.
- Selecting both "Only with conditions" and "Avoid" in the pregnancy list returns either status;
  adding a vegetarian status filter requires both list predicates to match.
- A copied `v=1` filtered URL reproduces the same result in a fresh session, while an obsolete list
  slug falls back safely and visibly.
