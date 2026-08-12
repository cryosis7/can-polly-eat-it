# F-19: Make Preparation Bands Collapsible

**Status:** Done

**Depends on:** [F-11: Make the Browse Hierarchy Legible and Collapsible](<11-make-browse-hierarchy-legible.md>), [F-18: Model Preparation as a Catalogue Dimension](<18-model-preparation-as-a-catalogue-dimension.md>)

**Governing decisions:** [model preparation as a catalogue dimension](<../decisions/2026-08-10 ADR - model preparation as a catalogue dimension.md>) and [model food groups as an unbounded category tree](<../decisions/2026-08-04 ADR - model food groups as an unbounded category tree.md>)

## Goal

As Polly, I need to collapse preparation bands such as `Raw fish` or `Smoked fish`, so that I can skip
preparation contexts I do not need without losing the category structure or changing the guidance
shown inside each band.

## Primary experience

1. Browse to a category with several preparation bands, such as `Seafood > Fish`.
2. See the normal category breadcrumb still attached to the real category: `Seafood > Fish`.
3. See each preparation band rendered as a lightweight collapsible sub-section inside that category,
   using the approved category-like divider treatment.
4. Read the entry count on each preparation band, for example `Raw fish` with `2 entries`.
5. Collapse `Raw fish` and skip straight to `Smoked fish` or `Freshly cooked fish`.
6. Expand a preparation band and see the same guidance callout and food cards that render today.

## Approved design artefact

The approved design direction is captured in
[19-collapsible-preparation-bands-demo.html](<artefacts/19-collapsible-preparation-bands-demo.html>).

The artefact is normative for the interaction shape and acceptance criteria:

- preparation bands use the lightweight category-like divider treatment, not the card or accordion
  alternatives;
- preparation bands show the preparation name and an entry count;
- the words "prep type subcategory" do not appear in the UI;
- category breadcrumbs stay unchanged, so `Fish` continues to show `Seafood > Fish`;
- existing food-card content remains unchanged inside the expanded band.

## Required behaviour

- Preparation bands render as lightweight collapsible sub-sections inside their real category.
- Preparation bands are not categories: they do not get category routes, category filter entries, or
  membership in category descendant calculations.
- The real category breadcrumb is unchanged. A category such as `Fish` still exposes its full
  breadcrumb as `Seafood > Fish`; preparation band rendering must not replace it with `Seafood` or
  append a synthetic preparation breadcrumb.
- Each preparation band shows its preparation name and an entry count, using plural-aware wording.
- Collapsing a preparation band hides only that band's guidance callout and guide entries.
- Collapsing one preparation band does not collapse sibling preparation bands or ancestor/descendant
  categories.
- Food cards, category guidance links, status labels, guidance summaries, inherited-origin
  disclosures, and source links inside an expanded preparation band keep their existing content and
  semantics.
- Collapse state is presentation only. It must not change the URL, result count, search matches,
  filter matches, guidance resolution, or the set of layers rendered.
- Search and filters must not leave matching rows unexpectedly hidden behind a collapsed preparation
  band.
- Preparation band controls expose their expanded state to assistive technology and are operable by
  keyboard with visible focus.

## Non-goals

- Treating a preparation as a category, second parent, route, or filter value.
- Adding the words "prep type subcategory" or other model-explaining labels to the user interface.
- Changing category breadcrumbs, category indentation, or category default collapse behaviour.
- Changing the food-card design, guidance-card content, status wording, guidance wording, citations,
  or source affordances.
- Persisting preparation-band collapse state across sessions or encoding it in the URL.
- Inferring, merging, promoting, or collapsing statuses across preparation states.

## Assumptions and open questions

- This is a presentation change governed by the existing category-tree and preparation-dimension ADRs;
  it does not need a new ADR because it does not alter the domain model, routing contract, data
  storage, or guidance resolution.
- F-11 already established category collapse as presentation-only. This feature applies the same
  principle one level lower to derived preparation bands.
- F-18 established that preparation groupings are rendering constructs, not synthetic categories. The
  approved design must preserve that boundary even while making the bands feel easier to browse.
- Open: whether preparation bands should default to expanded in the unfiltered catalogue, matching the
  current content visibility, or whether some contexts should start collapsed. Settled for the
  approved implementation plan: preparation bands default collapsed in the unfiltered catalogue, and
  search or filter views must still reveal matching rows rather than hiding them behind stale
  collapsed state.
- Approved implementation plan:
  [19-make-preparation-bands-collapsible-plan.md](<19-make-preparation-bands-collapsible-plan.md>).

## Acceptance criteria

- The implemented catalogue matches the approved design artefact's lightweight divider direction for
  preparation bands.
- A category row's breadcrumb remains unchanged when it contains collapsible preparation bands; for
  example, `Fish` still shows `Seafood > Fish`.
- Preparation bands do not display "prep type subcategory" or any equivalent model explanation in the
  user interface.
- A preparation band displays its name and entry count, for example `Raw fish` and `2 entries`.
- A reader can expand and collapse a preparation band with pointer and keyboard input, and a screen
  reader can determine the band's name, expanded/collapsed state, and entry count.
- In the unfiltered catalogue, preparation bands render collapsed by default.
- Collapsing `Raw fish` hides only the `Raw fish` guidance callout and entries; sibling bands such as
  `Smoked fish` remain available.
- Expanding a preparation band reveals the same guidance callout and food-card content that rendered
  before this feature.
- Collapsing or expanding a preparation band does not change the announced result count, URL query
  string, selected filters, matched rows, or guidance resolution.
- Search or filter results that match a preparation row remain discoverable and are not silently hidden
  by stale preparation-band collapse state.

## Validation

React Testing Library tests for preparation-band expand/collapse, entry counts, unchanged category
breadcrumbs, unchanged food-card content inside expanded bands, sibling isolation, and unchanged result
count. Chromium Playwright coverage for browsing a preparation-heavy category, collapsing a preparation
band to skip to the next one, and a filtered URL containing preparation rows. Existing axe-core WCAG
2.2 AA scans and repository-wide 100% statements, branches, functions, and lines coverage for
application source are retained.

Completed validation:

- `npm test -- src/features/catalogue/CataloguePage.test.tsx` — 43 passing.
- `npx playwright test e2e/catalogue.spec.ts` — 35 passing.
- `npm run typecheck` — passed.
- `npm run lint` — passed.
- `npm run test:coverage` — 235 passing; 100% statements, branches, functions, and lines.
- `prepare` subagent review — 0 blockers, no dependency-version, documentation-drift, or missing
  documentation findings.
