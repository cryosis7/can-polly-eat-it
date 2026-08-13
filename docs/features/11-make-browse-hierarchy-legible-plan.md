# F-11 Implementation Plan: Make the Browse Hierarchy Legible and Collapsible

**Feature:** [F-11](<11-make-browse-hierarchy-legible.md>)
**Status:** Implemented and verified

**Governing decisions:** [model food groups as an unbounded category tree](<../decisions/2026-08-04 ADR - model food groups as an unbounded category tree.md>), [assess categories as first-class subjects with inherited guidance](<../decisions/2026-08-06 ADR - assess categories as first-class subjects with inherited guidance.md>), [show scoped guidance with generic outcome filters](<../decisions/2026-08-06 ADR - show scoped guidance with generic outcome filters.md>), and [enforce complete coverage for application source](<../decisions/2026-08-05 ADR - enforce complete coverage for application source.md>)

## Design decisions settled by this plan

### 1. The breadcrumb stays

The brief left this open. It stays, for two reasons found in the code rather than by preference:

- `src/index.css` sets `.category-group { margin-inline-start: 0 }` inside the `48rem` breakpoint, so
  indentation is removed entirely on a phone. The breadcrumb is currently the only hierarchy signal
  at that width, and removing it would make the tree unreadable on mobile.
- The tree ADR's confirmation checklist requires that readable UI fixtures expose a full category
  breadcrumb.

It is restyled to lower visual weight rather than removed. Separately, a small indentation step is
restored at narrow widths so nesting is visible on a phone once parent headings exist; without it,
mobile shows a flat run of headings.

### 2. Clearing a filter returns to the reader's own expansion state

The brief left this open. Collapse state is modelled as `collapsedCategoryIds`, holding only what the
reader has deliberately collapsed or not yet opened. Filter-driven expansion is **derived, never
stored**: while a filter is active, the ancestors of matching entries are subtracted from the
collapsed set for rendering only.

Clearing the filter therefore restores exactly what the reader had open, rather than snapping
everything shut or leaving the whole catalogue expanded. This needs no extra state and no effect.

Narrowed by [F-20](<20-summarise-collapsed-rows-with-status-chip.md>) on 2026-08-13: "a filter" here
means a search, category, or outcome filter. Selecting a further dietary scope no longer derives any
expansion, because it changes which guidance is shown rather than which entries match.

### 3. Collapse is not URL state

Consistent with the brief's non-goals and the `v=1` contract owned by F-02 and F-08, expansion is
component state. It does not affect matching, the result count, or the announced results.

## Affected areas

| Area | Change |
| --- | --- |
| `src/domain/categoryTree.ts` | `CategoryDisplayRow` gains `ancestorIds` and `hasChildCategories`; new pure `visibleCategoryRows` and `withAncestorIds` helpers. |
| `src/domain/categoryTree.test.ts` | Cases for the new fields and helpers, including the 1,000-level fixture. |
| `src/components/GuideEntrySummary.tsx` | New. The shared per-scope entry presentation extracted from the existing food-card markup. |
| `src/features/catalogue/CataloguePage.tsx` | Ancestor-complete row selection, disclosure toggles, shared entry rendering, derived filter expansion. |
| `src/features/catalogue/CataloguePage.test.tsx` | New behaviour cases listed under Tests. |
| `src/index.css` | Toggle affordance and focus style, breadcrumb de-emphasis, narrow-viewport indentation. |
| `e2e/catalogue.spec.ts` | Default collapsed landing, expanding a group, filtered URL with matches inside collapsed groups. |

No change to `src/domain/filtering.ts`, `src/app/catalogueQuery.ts`, the URL contract, or any content
in `src/data/`.

## Constraints

- `src/domain/` must not import React, router, or browser modules. The new helpers are pure.
- No recursive component rendering, no depth constant, and no heading level mapped to depth. Rows stay
  flat and iterative; collapsing hides rows whose ancestor is collapsed rather than nesting elements.
- Indentation stays capped, as it is today, so deep trees cannot push content off-screen.
- Repository-wide 100% statements, branches, functions, and lines coverage for application source must
  be retained.

## Approach

### Ancestor-complete rows

A category row is rendered when it is a guide entry, when it has direct foods to show, **or when any
descendant satisfies either**. Build the third case by walking each content-bearing category's
`ancestorIds` and marking them, which fixes the 21 categories currently omitted. This is a set union
over existing flattened rows, so it adds no traversal beyond what `buildCategoryTree` already does.

### Visibility under collapse

A row is visible when none of its `ancestorIds` is in the effective collapsed set:

```
effectiveCollapsed = isFiltering
  ? collapsedCategoryIds \ ancestorsOfMatchingEntries
  : collapsedCategoryIds
```

`collapsedCategoryIds` initialises to the root category ids, giving the brief's default: roots
collapsed, descendants expanded inside them.

### Shared entry presentation

Extract the existing food-card body into `GuideEntrySummary`, taking the resolved assessment, guidance
list, and return search. Render it for foods and for assessed categories alike, so a category entry
gains the summary and source link it is missing today. An assessed category renders its entry above
its child rows; a category without an assessment renders a heading only.

### Disclosure semantics

Each expandable category heading contains a `<button type="button" aria-expanded={...}>` carrying the
category name plus visually hidden level text, so a screen-reader user hears name, state, and level
without heading levels encoding depth. An assessed category's link to its detail page lives in its
entry summary, so the heading button is never a nested interactive control.

## Tests

Domain unit tests in `src/domain/categoryTree.test.ts`:

1. `ancestorIds` excludes self and is ordered root-first.
2. `hasChildCategories` distinguishes a leaf from a parent.
3. `visibleCategoryRows` hides descendants of a collapsed ancestor.
4. `visibleCategoryRows` keeps a row whose collapsed ancestor is subtracted from the effective set.
5. The 1,000-level fixture flattens and filters without a stack overflow.

React Testing Library tests in `src/features/catalogue/CataloguePage.test.tsx`:

6. `Cakes, slices and muffins` renders as a heading, so `Plain cakes, slices and muffins` is not shown
   beneath an unrelated heading.
7. No category with visible descendants is omitted.
8. An assessed category renders status, summary, and source link, matching a food entry.
9. Roots are collapsed by default and their descendants are not in the document.
10. Toggling a root reveals its descendants; `aria-expanded` reflects state.
11. An active search reveals a match inside an otherwise collapsed group.
12. Clearing the search returns to the reader's manual expansion, not a fully expanded page.
13. The announced result count is unchanged by collapsing or expanding.

Chromium Playwright in `e2e/catalogue.spec.ts`:

14. Default landing shows collapsed roots and materially less page height.
15. Expanding a group by keyboard reveals its entries with visible focus.
16. A filtered URL shows matches inside groups that are collapsed by default.

## Ordered tasks

1. Extend `CategoryDisplayRow` with `ancestorIds` and `hasChildCategories`; add `visibleCategoryRows`
   and `withAncestorIds`. Add domain tests 1-5.
2. Extract `GuideEntrySummary` and re-point the existing food card at it, with no behaviour change.
   Confirm the existing suite still passes.
3. Render ancestor-complete rows in `CataloguePage`. Add tests 6-7.
4. Render assessed categories through `GuideEntrySummary`. Add test 8.
5. Add collapse state, toggles, and derived filter expansion. Add tests 9-13.
6. Style the toggle, focus ring, de-emphasised breadcrumb, and narrow-viewport indentation.
7. Add Playwright scenarios 14-16.
8. Run targeted validation, then the full gates.
9. Pre-PR verification: instruct a subagent to run the `prepare` skill against the branch diff, and
   record its findings, or their resolution, in the feature brief before F-11 moves to `Done`.

## Validation

Targeted first, then the full gates:

- `npm test -- src/domain/categoryTree.test.ts src/features/catalogue/CataloguePage.test.tsx`
- `npm run typecheck`
- `npm run lint`
- `npm run test:coverage` — 100% thresholds retained
- `npm run test:e2e`
- `npm run build`

## Implementation result

All nine tasks are complete. Deviations from the plan as written, recorded rather than treated as
defects:

- **Level is announced via `aria-label` on the toggle, not a visually hidden span.** The span put
  ", level N" inside each `<section>`'s accessible name, because the section is labelled by the
  heading that contained it. Moving the level onto the button's `aria-label` keeps the region named
  by its category alone while the toggle still announces name, state, and level.
- **The breadcrumb is omitted on root rows.** For a root the breadcrumb is only the category's own
  name, so it duplicated the heading directly beneath it. Nested rows keep the full path, which is
  what the tree ADR's confirmation checklist requires and what the Playwright assertions cover.
- **Tests query the toggle button rather than the heading for levelled names.** `dom-accessibility-api`
  under jsdom does not fold a descendant button's `aria-label` into the heading's accessible name the
  way Chromium does, so the button is the reliable target. Chromium behaviour is covered by the
  Playwright scenarios.
- **One extra test beyond the plan.** `collapses an expanded nested group without affecting its
  siblings` was added after coverage showed the collapse direction of `toggleCategory` was never
  exercised — the planned tests only ever expanded. This was a genuine behaviour gap, not a coverage
  formality.

### Measured outcome

The unfiltered catalogue at a 900px viewport went from **35,379px to 1,161px** of scroll height, with
8 collapsed root groups. The result count is unchanged at 143. At 360px the nesting steps 16px → 32px
→ 40px with no horizontal overflow, where indentation was previously suppressed entirely.

### Validation evidence

- `npm run test:coverage`: 88 tests pass; 100% statements, branches, functions, and lines retained.
- `npm run test:e2e`: 19 Chromium scenarios pass.
- `npm run typecheck`, `npm run lint`, `npm run build`: clean.

### Pre-PR `prepare` review

Run by a subagent against the uncommitted diff (base `50b07f1`, 12 files). Result: no dependency
changes to check, and no undocumented architecture — the collapse model, ancestor-complete rows, and
shared guide-entry rendering are covered by this plan, and the tree ADR still governs the flattened,
non-recursive rendering constraint. Two documentation findings, both fixed:

1. **Must-fix.** The feature brief and register still described F-11 as `Planned` after it was
   implemented. Both updated to `Done`.
2. **Should-fix.** This plan named the helper `ancestorIdsOf`, but the shipped export is
   `withAncestorIds`. The plan was corrected to match the code, since the name change was a
   deliberate improvement — the helper returns a set of ids *including* the matches, not just their
   ancestors.

The reviewer noted it could not reach `origin`, so the base was resolved locally.

## Risks

- **Coverage regression.** New branches for collapse and ancestor completion are easy to leave
  partially covered. Each branch has a named test above.
- **Hidden content in tests.** Existing catalogue tests assert on entries that will start collapsed.
  Task 2 deliberately lands the extraction with no behaviour change so the collapse change in task 5
  is the only cause of any test churn; expected churn is updating those tests to expand first.
- **Mobile regression.** Restoring indentation at narrow widths touches F-06's mobile work, so the
  narrow-viewport rendering is checked before completion.
