# F-19 Implementation Plan: Make Preparation Bands Collapsible

**Feature:** [F-19](<19-make-preparation-bands-collapsible.md>)
**Status:** Complete — tasks 1-7 done and validated; `prepare` found 0 blockers

## Progress

Tasks 1-7 are implemented. Preparation bands now render with accessible disclosure controls, default
collapsed in the unfiltered catalogue, and auto-expanded in active result views so search and filter
matches are not hidden. Category breadcrumbs, result counts, URL state, filtering, and guidance
resolution are unchanged.

Validation so far:

- `npm test -- src/features/catalogue/CataloguePage.test.tsx` — 43 passing.
- `npx playwright test e2e/catalogue.spec.ts` — 35 passing.
- `npm run typecheck` — passed.
- `npm run lint` — passed.
- `npm run test:coverage` — 235 passing; 100% statements, branches, functions, and lines.
- `prepare` subagent review — 0 blockers, no dependency-version, documentation-drift, or missing
  documentation findings.

**Governing decisions:** [model preparation as a catalogue dimension](<../decisions/2026-08-10 ADR - model preparation as a catalogue dimension.md>), [model food groups as an unbounded category tree](<../decisions/2026-08-04 ADR - model food groups as an unbounded category tree.md>), and [enforce WCAG 2.2 AA with axe-core in Playwright](<../decisions/2026-08-07 ADR - enforce WCAG 2.2 AA with axe-core in Playwright.md>)

## Planning baseline

F-19 is a presentation-only feature. It must not change the category tree, preparation vocabulary,
assessment resolution, row filtering, result counting, detail routes, or URL query contract. A
preparation band remains a rendering construct derived from category rows; it is not inserted into
`CategoryTree`, exposed in category filters, given a category route, or treated as a subject.

The approved design artefact in
[19-collapsible-preparation-bands-demo.html](<artefacts/19-collapsible-preparation-bands-demo.html>)
is normative for the lightweight category-like divider treatment, preparation name, entry count,
absence of model-explaining labels, unchanged breadcrumbs, and unchanged food-card content inside an
expanded band.

The product decision for default state is: in the unfiltered catalogue, preparation bands render
collapsed by default. Search and filter views must still make matching rows discoverable; stale
collapsed presentation state must not silently hide results the current query or filters selected.

## Affected areas

- `src/features/catalogue/CataloguePage.tsx` and adjacent catalogue components that render category
  rows, preparation headings, group callouts, and guide-entry cards.
- Existing catalogue component tests covering preparation rows, breadcrumbs, filtering, result counts,
  and accessibility semantics.
- Existing Playwright catalogue scenarios and accessibility scans for browse, filtered URLs, and
  preparation-heavy categories.
- Styling that owns category-like dividers and disclosure controls.

## Implementation tasks

1. **Locate the current preparation-band render seam**
   - Identify the component or render branch that emits preparation headings and their callout plus
     guide-entry rows.
   - Confirm it receives enough stable identity to key collapse state by real category id and
     preparation id without introducing synthetic category ids.
   - Add or update focused tests that describe the current expanded content, unchanged breadcrumbs,
     and unchanged result count before changing behaviour where practical.

2. **Introduce accessible preparation-band disclosure state**
   - Render each preparation band with a keyboard-operable disclosure control using the approved
     lightweight divider treatment.
   - The control label must expose the preparation name and plural-aware entry count, and its expanded
     state must be available to assistive technology.
   - Key disclosure state by category and preparation so collapsing one band does not collapse sibling
     bands or ancestor/descendant categories.
   - Do not write collapse state to the URL or persistent storage.

3. **Apply the default and result-discovery policy**
   - Default preparation bands to collapsed in the unfiltered catalogue.
   - When search text, category filtering, or outcome/scope filtering creates a result view, ensure
     matching preparation rows are discoverable rather than hidden behind stale collapse state. Prefer
     deriving expansion from active result constraints or resetting stale collapsed state at the
     catalogue render seam; do not change filter predicates, result counts, URL state, or guidance
     resolution to achieve this.
   - Empty search remains the normal catalogue and therefore returns to the default collapsed state.

4. **Preserve existing guidance and row semantics**
   - Expanding a band must reveal the same guidance callout and guide-entry cards that render today.
   - Category breadcrumbs remain the real category breadcrumb, such as `Seafood > Fish`.
   - The UI must not say "prep type subcategory" or equivalent model-explaining language.
   - Collapsing or expanding a band must not change announced result count, selected filters, matched
     rows, status labels, guidance summaries, inherited-origin disclosures, source links, or resolved
     layers.

5. **Update focused automated coverage**
   - React Testing Library coverage for default-collapsed preparation bands, pointer and keyboard
     expansion, `aria-expanded`, entry-count wording, unchanged breadcrumbs, unchanged expanded food
     content, sibling isolation, unchanged result count, and discoverability in searched or filtered
     views.
   - Chromium Playwright coverage for browsing a preparation-heavy category, expanding/collapsing a
     preparation band to skip to the next one, and opening a filtered URL containing preparation rows.
   - Existing axe-core WCAG 2.2 AA scans must remain green.

6. **Run targeted validation**
   - Run the narrowest catalogue/component tests that cover the changed render seam.
   - Run the focused Playwright scenario(s) for the preparation-band interaction and filtered URL.
   - Run `npm run typecheck`, `npm run lint`, and `npm run test:coverage` if the touched files affect
     typed application source or global coverage.

7. **Run the pre-merge prepare review**
   - After implementation and targeted validation, instruct a subagent to run the `prepare` skill
     against the local branch diff against `main`. The repository has no remote, no `origin`, no pull
     requests, and no CI.
   - Resolve every mechanical finding or record an explicit accepted rationale in this plan or the
     feature brief before marking F-19 `Done` or merging into `main`.

## Done evidence to record

Before moving the feature to `Done`, record:

- the completed task range and any deviations from this plan;
- the targeted validation commands and results;
- the `prepare` subagent result and the resolution or accepted rationale for each finding;
- confirmation that the feature brief and register both say `Done`.
