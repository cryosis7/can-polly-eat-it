# F-11: Make the Browse Hierarchy Legible and Collapsible

**Status:** Done

**Depends on:** [F-01: Browse the Food Guide](<01-browse-food-guide.md>), [F-09: Assess and Browse Food Categories](<09-assess-and-browse-food-categories.md>)

**Governing decisions:** [model food groups as an unbounded category tree](<../decisions/2026-08-04 ADR - model food groups as an unbounded category tree.md>), [assess categories as first-class subjects with inherited guidance](<../decisions/2026-08-06 ADR - assess categories as first-class subjects with inherited guidance.md>), and [show scoped guidance with generic outcome filters](<../decisions/2026-08-06 ADR - show scoped guidance with generic outcome filters.md>)

## Goal

As Polly, I need every entry in the guide to sit visibly beneath the group it actually belongs to, and
I need to collapse groups I do not care about, so that I can trust what a nested entry is a kind of
and reach the part of the guide I want without scrolling past all of it.

## Primary experience

1. Open the guide and see a short list of top-level groups, collapsed, rather than the whole
   catalogue at once.
2. Expand `Breads and cereals` and see `Breads`, `Cakes, slices and muffins`, and `Cereals`.
3. See `Plain cakes, slices and muffins` nested beneath a visible `Cakes, slices and muffins`
   heading, so its nesting is self-explanatory.
4. Read the same status, summary, and source for `Plain cakes, slices and muffins` as for
   `Breakfast cereals`, because both are guide entries.
5. Search or filter, and see matching groups open automatically so no result is hidden.

## Problem evidence

- The catalogue omits any category that has neither direct foods nor its own assessment. That hides
  21 categories in the current content, including `Cakes, slices and muffins`, `Cheese`, `Custard`,
  `Milk`, and `Seafood`, so their children render indented beneath an unrelated preceding heading.
- An assessed category renders only a heading and a one-line status, while a food renders a card with
  summary and source. The category's authored summary and citation exist in content but are never
  shown, so two guide entries of equal standing look unequal.
- The unfiltered catalogue renders 48 category sections and roughly 35,000px of scroll at a 900px
  viewport, with no way to collapse anything.

## Required behaviour

- Every ancestor of a visible entry is itself rendered as a visible heading. No entry may appear
  nested beneath a heading that is not its parent.
- A category heading is a collapsible disclosure that exposes its expanded state to assistive
  technology and is operable by keyboard with visible focus.
- With no search or filter applied, top-level groups start collapsed and their descendants start
  expanded, so expanding one group reveals that whole group.
- When a search or filter is active, every group containing a match is expanded so that no matching
  entry is hidden behind a collapsed group.
- Collapse state is presentation only. It must not change the result count, the URL contract, which
  entries match, or the announced results.
- A food and an assessed category use one shared guide-entry presentation: name link, per-scope status
  as text and icon as well as colour, summary, inherited-origin disclosure where guidance is
  inherited, and a source link wherever a citation exists.
- An assessed category's entry sits above its child entries and remains identifiable as a group that
  also carries its own guidance.
- A category with no authored assessment stays a plain browse heading and is never presented as
  carrying guidance, but is always visible when it has visible descendants.
- The view is derived from flattened display rows with depth-safe indentation and an exposed level.
  No recursive component rendering, no depth constant, and no heading level mapped to depth.

## Non-goals

- Changing which entries match, the `v=1` URL contract, or the meaning of the result count.
- Persisting expansion state across sessions or encoding it in the URL.
- Introducing a hierarchy depth limit or truncating deep branches.
- List virtualisation or other performance work not required within the 2,000-food/500-category
  budget.
- Changing any reviewed guidance wording, status, or source; content changes belong to
  [F-12](<12-lift-group-guidance-onto-categories.md>).

## Assumptions and open questions

- Collapsing is a presentational concern, so it needs no ADR: the governing tree ADR already requires
  flattened display rows and forbids recursive rendering, and this feature stays inside that pattern
  by hiding rows whose ancestor is collapsed rather than nesting components.
- Rendering previously omitted ancestor headings increases the number of visible headings but not the
  number of guide entries, so the result count is unaffected.
- Open: whether an expanded group should also be reachable by a direct URL is deliberately left out of
  scope here, because the `v=1` contract is owned by F-02 and F-08.
- Resolved by the implementation plan: the per-row breadcrumb stays. Indentation is removed entirely
  below the `48rem` breakpoint, so the breadcrumb is the only hierarchy signal on a phone, and the
  tree ADR's confirmation checklist requires UI fixtures to expose a full breadcrumb. It is
  de-emphasised visually, and a small indentation step is restored at narrow widths.
- Resolved by the implementation plan: clearing a filter returns to the reader's own expansion state.
  Filter-driven expansion is derived rather than stored, so it evaporates when the filter clears
  without discarding anything the reader opened by hand.

## Implementation plan

[F-11 Implementation Plan](<11-make-browse-hierarchy-legible-plan.md>), approved and complete.

## Acceptance criteria

- `Plain cakes, slices and muffins` renders beneath a visible `Cakes, slices and muffins` heading, and
  no category with visible descendants is omitted from the browse view.
- An assessed category such as `Plain cakes, slices and muffins` shows the same status, summary, and
  primary-source link that a food entry shows for the same selected scopes.
- Landing on the guide with no search or filter shows only top-level group headings, collapsed, and
  substantially reduces total page scroll compared with the current view.
- Searching a term that matches an entry inside a collapsed group reveals that entry without the user
  expanding anything, and the announced result count is unchanged from the equivalent view today.
- A keyboard-only user can expand and collapse every group, and a screen-reader user hears each
  group's name, its expanded or collapsed state, and its level.
- A food attached beneath the 1,000-level test hierarchy still renders with its full breadcrumb and
  without recursive rendering or a stack overflow.

## Validation

React Testing Library tests for ancestor-heading completeness, shared entry presentation across food
and assessed category, default collapse state, auto-expansion under an active search or filter, and an
unchanged result count. Chromium Playwright scenarios for the default collapsed landing view, expanding
a group, and a filtered URL whose matches sit inside otherwise collapsed groups. Repository-wide 100%
statements, branches, functions, and lines coverage for application source is retained. A subagent runs
the `prepare` skill after implementation and targeted validation, before the pull request is opened and
before this feature moves to `Done`.

### Result

- `npm run test:coverage`: 88 tests pass, 100% statements/branches/functions/lines retained.
- `npm run test:e2e`: 19 Chromium scenarios pass.
- `npm run typecheck`, `npm run lint`, `npm run build`: clean.
- Measured: unfiltered catalogue scroll height fell from 35,379px to 1,161px at a 900px viewport, with
  the result count unchanged at 143. Nesting is now visible at 360px, where indentation was previously
  suppressed entirely.
- Pre-PR `prepare` review: see the implementation plan.
