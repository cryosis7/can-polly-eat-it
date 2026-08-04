# Feature 01: Browse the Food Guide

## Goal

Let Polly scan the full food guide in familiar groups and immediately see each food's outcome for
the selected guidance list.

## Primary experience

1. Open the home page.
2. See the pregnancy food-safety list selected by default and a concise explanation of its status
   labels.
3. Browse grouped categories in editorial order, for example `Dairy -> Cheese -> Hard cheese`.
4. See food cards inside their category with an explicit text status, summary, and source link.
5. Follow a card to learn the details.

## Required behaviour

- Render any number of category levels without a product-defined depth limit, using a full breadcrumb
  and depth-safe indentation rather than heading levels.
- Render categories with both direct foods and subcategories correctly.
- Show green, amber, red, and grey states with text and icons as well as colour.
- Resolve missing assessment data as either "Not assessed" inside the list's reviewed coverage or
  "Outside current coverage"; never show either as safe.
- Give each food card a direct link to the primary source as well as its detail route.
- Preserve stable category and food order supplied by content data.
- Keep the view usable with a keyboard and on a narrow viewport.
- Keep the initial fully rendered catalogue within the 2,000-food/500-category architecture budget;
  do not silently truncate results when the budget is exceeded.

## Not in this feature

- Full-text search and filters.
- A food detail explanation.
- Content editing in the browser.
- Personalised advice or saved favourites.

## Test confidence

Tests for this feature must retain the repository-wide 100% global statements, branches, functions,
and lines coverage thresholds for application source.

## Acceptance examples

- A food attached beneath a 1,000-level test hierarchy can be derived by the domain layer without a
  stack overflow; the readable UI fixture shows its complete category breadcrumb.
- A food inside pregnancy coverage without an assessment shows "Not assessed", while a food outside
  that coverage shows "Outside current coverage"; both are visually distinct from "OK to eat".
- A screen-reader user hears the category heading and status label for each food card.
