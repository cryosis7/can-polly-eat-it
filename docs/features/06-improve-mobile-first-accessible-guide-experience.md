# F-06: Improve the Mobile-First Accessible Guide Experience

**Status:** Done

**Depends on:** [F-01: Browse the Food Guide](<01-browse-food-guide.md>) and [F-02: Search and Filter Foods](<02-search-and-filter-foods.md>)

**Governing decisions:** [Static TypeScript React SPA](<../decisions/2026-08-04 ADR - use a static TypeScript React SPA.md>) and [scoped guidance with generic outcome filters](<../decisions/2026-08-06 ADR - show scoped guidance with generic outcome filters.md>)

## Goal

As someone checking food guidance on a phone or browser, I need an approachable, accessible guide
that makes browsing and filtering easy so I can understand reviewed information without fighting
dense controls or relying on colour.

## Primary experience

1. Open the guide on a narrow or wide viewport and immediately understand its purpose and medical
   information disclaimer.
2. Read clear guidance headings, status meanings, and food cards in a warm editorial presentation.
3. Search food names from the always-visible search field.
4. On a narrow viewport, open the native `Filters` disclosure to narrow by a path-aware category
   control, dietary scopes, or generic outcome bands; on a wider viewport, use the same controls
   without concealing them.
5. See the result count, active filter chips, and no-results guidance update without losing the
   shareable URL or keyboard focus.

## Required behaviour

- Establish a strong warm editorial visual system for the app shell and catalogue: a paper-like
  background, dark ink header, terracotta interaction accent, considered display hierarchy, and
  elevated food cards. Use system font fallbacks and local CSS rather than a remote font or a new
  dependency.
- Express the visual system through reusable CSS custom properties for colour, typography, spacing,
  radii, focus treatment, and status tones so F-03 can reuse it later.
- Reflow the shell, guide introduction, status key, filter controls, active chips, category groups,
  and food cards for narrow and wide viewports without horizontal scrolling.
- Keep search, active-filter chips, and result feedback visible while the detailed controls are
  collapsed on narrow viewports.
- Use a native `details` and `summary` disclosure for detailed filters on narrow viewports. It must
  contain the category, dietary-scope, generic-outcome, and clear-filter controls; it is initially expanded
  on wider viewports and initially collapsed on narrow viewports.
- Present category narrowing as a hierarchy-aware control that can select a parent, intermediate, or
  leaf category by its full path, for example `Dairy > Cheese > Soft cheese`; selecting any category
  continues to include descendant foods.
- Show category-path context on catalogue cards or their containing category rows so a person can see
  why a food appears under a nested branch without relying on heading depth alone.
- Group dietary scopes and generic outcome bands as separate native checkbox facets, rather than
  replacing them with a custom dropdown multi-select.
- Preserve the versioned scope/outcome URL contract, filtering semantics, result-count announcement,
  invalid-filter announcement, no-results state, direct food links, and status/source information.
- Add an in-page skip link, a keyboard-reachable main-content target, and clear structural
  landmarks in the shared shell.
- Retain native form labels and fieldsets; provide visible focus indicators, keyboard-operable
  controls, sufficiently large touch targets, and status text/icons in addition to colour.
- Do not rely on hover to expose information or controls. Respect `prefers-reduced-motion` for any
  visual transition.

## Non-goals

- Implementing or designing the unbuilt food-detail experience in F-03.
- A user-selectable light/dark theme, saved preference, or any other personalisation.
- Changing guidance content, routing, or application dependencies. F-08 later changed filtering
  logic, the URL contract, and the presentation of guidance scopes.
- A custom modal, side drawer, or JavaScript-only filter experience.
- A custom multi-select dropdown or dense comparison matrix for guidance statuses.

## Assumptions and open questions

- **Implementation plan:** [F-06 implementation plan](<06-improve-mobile-first-accessible-guide-experience-plan.md>) records the approved delivery work.
- **Design direction:** warm editorial food guide. This is the default visual identity, not a
  runtime theme selector.
- **Mobile filter pattern:** native `details`/`summary` is preferred for semantic, keyboard, and
  progressive-enhancement reliability.
- **Filter mental model:** filters are facets. Category is one hierarchy-aware facet; dietary scopes
  are cumulative constraints and generic outcome bands are alternatives within every selected scope.
  This supports future vegetarian and vegan lists without adding hard-coded dietary fields to food
  records.
- The initial disclosure state may reflect the viewport when the page first renders; resizing does
  not need to override the person's subsequent open/closed choice.
- The scope and delivery priority were approved for implementation on 2026-08-05. The documented
  acceptance criteria were validated with React Testing Library, 100% Vitest coverage, and Chromium
  Playwright desktop and 320px mobile scenarios.

## Acceptance criteria

- At a 320px viewport, the shell, catalogue, cards, filters, and chips remain readable and usable
  without horizontal scrolling; touch controls have practical hit areas.
- At a desktop viewport, the editorial hierarchy is readable and detailed filters are immediately
  available without a disclosure interaction.
- Selecting `Dairy`, `Dairy > Cheese`, or `Dairy > Cheese > Soft cheese` narrows to the selected
  category's descendant foods while preserving the versioned scope/outcome URL contract.
- Catalogue cards or visible category rows expose the relevant category path so nested results remain
  understandable when a person arrives from search or a filtered URL.
- Pregnancy, vegetarian, and future vegan scope controls can be shown using native checkbox groups;
  generic outcomes remain alternatives within every selected scope, while selected scopes remain
  cumulative.
- A keyboard user can skip repeated shell content, reach the main guide, operate search, disclosure,
  selects, checkboxes, clear action, and chips, and can always see where focus is.
- A screen-reader user receives semantic landmarks, labelled controls, results feedback, status
  labels, and information that does not rely on status colour.
- Opening and using mobile filters changes the same catalogue results and canonical versioned URL as
  the desktop controls; clearing and removing active filters continue to work.
- The warm editorial design provides distinct text, status, and interaction treatments while
  retaining legible contrast.

## Validation

When implementation is approved, retain the repository-wide 100% global statements, branches,
functions, and lines coverage thresholds for application source. Add focused React Testing Library
coverage for the shell and filter-disclosure semantics, and Chromium Playwright scenarios for mobile
and desktop filtering, direct filtered URLs, keyboard-visible focus, and a narrow responsive
viewport.

The colour-independence, native-label, and semantic-structure criteria above are additionally
enforced automatically by the WCAG 2.2 AA `axe-core` scans in `e2e/accessibility.spec.ts`, added
under [Enforce WCAG 2.2 AA with axe-core in Playwright](<../decisions/2026-08-07 ADR - enforce WCAG 2.2 AA with axe-core in Playwright.md>).
Those scans found and fixed one real defect in this feature's delivered styling: the green status
icon rendered white text at 3.3:1, below the 4.5:1 minimum, and `--status-green` was darkened to
`#4c7638`. The scans do not replace the assertions for visible focus, announcement text, or textual
status labels, which axe cannot verify.
