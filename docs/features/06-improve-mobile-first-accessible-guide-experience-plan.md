# F-06 Implementation Plan: Improve the Mobile-First Accessible Guide Experience

**Status:** Completed 2026-08-05

## Constraints

- Keep the existing React static SPA, data model, routes, filter predicates, and versioned URL
  contract unchanged.
- Use local CSS and system font stacks only; do not add dependencies or remote resources.
- Retain native `details`/`summary`, selects, checkboxes, labels, and fieldsets.
- Preserve the display list as a display choice rather than a filter constraint.

## Delivery tasks

1. Add shared shell landmarks, a skip link, and a keyboard-focusable main-content target.
2. Establish reusable local CSS tokens for the warm editorial palette, typography, spacing, radii,
   focus treatment, and status tones; apply them to the shell, catalogue, cards, filters, and detail
   pages.
3. Keep search, active-filter chips, and result feedback visible. Move category, display-list,
   status-facet, and clear-filter controls into a native filter disclosure that starts closed at a
   narrow viewport and open at a wide viewport without overriding a later user choice.
4. Keep category options path-aware, render the selected display list's status facet first, and
   retain independent native checkbox fieldsets for every available guidance list.
5. Add focused React Testing Library and Chromium coverage for the shared landmarks, disclosure,
   responsive layout, direct filtered URLs, and keyboard-visible focus.

## Validation

- `npm test`
- `npm run test:coverage`
- `npm run test:e2e`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
